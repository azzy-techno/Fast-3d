import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  FileLoader,
  Group,
  Mesh,
  Quaternion,
  Vector3,
  MathUtils,
  type Material,
} from "three";
import { assetUrl } from "../lib/assets";
import { journeyState, routeDistance, sampleGuide } from "./journey";

export function Host() {
  const { scene } = useGLTF(assetUrl("guide/host.glb"));
  const data = useLoader(FileLoader, assetUrl("guide/motion.json")) as string;
  const root = useRef<Group>(null);
  const rig = useMemo(() => {
    const model = clone(scene);
    const bones = new Map<string, Bone>();
    const ownedMaterials: Material[] = [];
    model.traverse((o) => {
      if (o instanceof Bone) bones.set(o.name.replace(/^mixamorig:?/, ""), o);
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.name.includes("Headwear")) o.visible = false;
        if (o.name.includes("Outfit")) {
          const material = (
            Array.isArray(o.material) ? o.material[0] : o.material
          ).clone();
          if ("color" in material)
            (material as import("three").MeshStandardMaterial).color.set(
              "#526b85",
            );
          o.material = material;
          ownedMaterials.push(material);
        }
      }
    });
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const scale = 1.76 / (bounds.max.y - bounds.min.y);
    model.scale.setScalar(scale);
    model.position.y = -bounds.min.y * scale;
    const mixer = new AnimationMixer(model);
    const clips = (
      JSON.parse(data) as Parameters<typeof AnimationClip.parse>[0][]
    ).map((c) => AnimationClip.parse(c));
    const walk = mixer.clipAction(clips.find((c) => c.name === "Walk")!).play();
    const idle = mixer.clipAction(clips.find((c) => c.name === "Idle")!).play();
    return { model, bones, mixer, walk, idle, ownedMaterials };
  }, [scene, data]);
  const state = useMemo(
    () => ({
      p: new Vector3(),
      face: new Vector3(),
      previous: new Vector3(),
      delta: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      direction: new Vector3(),
      q: new Quaternion(),
      parent: new Quaternion(),
      world: new Quaternion(),
      walking: 0,
      initialized: false,
      angle: 0,
      phase: 0,
      wave: 1,
      up: new Vector3(0, 1, 0),
    }),
    [],
  );
  useEffect(
    () => () => {
      rig.mixer.stopAllAction();
      rig.mixer.uncacheRoot(rig.model);
      rig.ownedMaterials.forEach((material) => material.dispose());
    },
    [rig],
  );
  useFrame(({ clock, camera, gl }, dt) => {
    if (!root.current) return;
    const p = journeyState.progress;
    sampleGuide(p, state.p, state.face);
    const distance = state.initialized
      ? Math.hypot(state.p.x - state.previous.x, state.p.z - state.previous.z)
      : 0;
    state.delta.copy(state.p).sub(state.previous);
    state.previous.copy(state.p);
    state.initialized = true;
    const walking =
      distance / Math.max(dt, 0.001) > 0.06 && p > 0.7 && p < 11.84 ? 1 : 0;
    state.walking = MathUtils.damp(
      state.walking,
      walking,
      10,
      Math.min(dt, 0.1),
    );
    state.phase += (distance / 1.25) * rig.walk.getClip().duration;
    rig.walk.time = state.phase % rig.walk.getClip().duration;
    rig.idle.time = clock.elapsedTime % rig.idle.getClip().duration;
    rig.walk.setEffectiveWeight(state.walking);
    rig.idle.setEffectiveWeight(1 - state.walking);
    rig.mixer.update(0);
    const waving = p < 0.7 || p > 11.84;
    state.wave = MathUtils.damp(
      state.wave,
      waving ? 1 : 0,
      8,
      Math.min(dt, 0.1),
    );
    const direction = waving
      ? state.delta.copy(camera.position).sub(state.p)
      : walking
        ? state.delta
        : state.delta.copy(state.face).sub(state.p);
    if (direction.lengthSq() > 0.000001) {
      const desired = Math.atan2(direction.x, direction.z);
      state.angle +=
        Math.atan2(
          Math.sin(desired - state.angle),
          Math.cos(desired - state.angle),
        ) *
        (1 - Math.exp(-Math.min(dt, 0.1) * 9));
    }
    root.current.position.copy(state.p);
    root.current.rotation.y = state.angle;
    root.current.updateMatrixWorld(true);
    const feet = ["LeftFoot", "RightFoot", "LeftToeBase", "RightToeBase"].map(
      (name) => rig.bones.get(name)?.getWorldPosition(state.a).y ?? Infinity,
    );
    rig.model.position.y += state.p.y + 0.045 - Math.min(...feet);
    rig.model.updateMatrixWorld(true);
    // Layer world-space arm gestures onto the walk/idle skeleton. The imported
    // mesh has articulated hands and fingers; no separate cartoon limb meshes.
    const aim = (
      boneName: string,
      childName: string,
      x: number,
      y: number,
      z: number,
      weight: number,
    ) => {
      const bone = rig.bones.get(boneName),
        child = rig.bones.get(childName);
      if (!bone || !child) return;
      bone.getWorldPosition(state.a);
      child.getWorldPosition(state.b);
      state.b.sub(state.a).normalize();
      state.direction
        .set(x, y, z)
        .normalize()
        .applyAxisAngle(state.up, state.angle);
      state.q.setFromUnitVectors(state.b, state.direction);
      bone.getWorldQuaternion(state.world);
      state.q.multiply(state.world);
      bone.parent!.getWorldQuaternion(state.parent).invert();
      state.q.premultiply(state.parent);
      bone.quaternion.slerp(state.q, weight);
      bone.updateMatrixWorld(true);
    };
    if (state.wave > 0.01) {
      aim("RightArm", "RightForeArm", -0.7, 0.48, 0.1, state.wave);
      aim(
        "RightForeArm",
        "RightHand",
        Math.sin(clock.elapsedTime * 5) * 0.35,
        1,
        0.12,
        state.wave,
      );
      rig.bones
        .get("RightHand")
        ?.rotateY(Math.sin(clock.elapsedTime * 5) * 0.18 * state.wave);
    } else if (state.walking < 0.65) {
      const presenting = (1 - state.walking) * 0.9;
      aim("RightArm", "RightForeArm", -0.75, -0.4, 0.45, presenting);
      aim("RightForeArm", "RightHand", -0.4, 0.25, 1, presenting);
    }
    gl.domElement.dataset.hostScale = rig.model.scale.x.toFixed(4);
    gl.domElement.dataset.guide = waving
      ? "waving"
      : state.walking > 0.5
        ? "walking"
        : "presenting";
    gl.domElement.dataset.guidePosition = state.p
      .toArray()
      .map((n) => n.toFixed(2))
      .join(",");
    gl.domElement.dataset.guideDistance = routeDistance(p).toFixed(2);
  });
  return (
    <group ref={root} name="FAST-human-guide">
      <primitive object={rig.model} />
    </group>
  );
}
