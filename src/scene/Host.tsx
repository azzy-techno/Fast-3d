import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Quaternion, Vector3, MathUtils } from "three";
import { useHumanRig, groundHuman, standHuman, WALK_STRIDE } from "./HumanRig";
import {
  journeyState,
  routeDistance,
  sampleGuide,
  guideIsPresenting,
} from "./journey";
export function Host() {
  const root = useRef<Group>(null);
  const rig = useHumanRig();
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
    state.phase += (distance / WALK_STRIDE) * rig.walk.getClip().duration;
    rig.walk.time = state.phase % rig.walk.getClip().duration;
    rig.idle.time = clock.elapsedTime % rig.idle.getClip().duration;
    rig.walk.setEffectiveWeight(state.walking);
    rig.idle.setEffectiveWeight(1 - state.walking);
    rig.mixer.update(0);
    standHuman(rig, 1 - state.walking);
    const waving = p < 0.7 || p > 11.84;
    state.wave = MathUtils.damp(
      state.wave,
      waving ? 1 : 0,
      8,
      Math.min(dt, 0.1),
    );
    const presentingHere = guideIsPresenting(p);
    const direction = waving
      ? state.delta.copy(camera.position).sub(state.p)
      : walking
        ? state.delta
        : presentingHere
          ? state.delta.copy(state.face).sub(state.p)
          : state.delta.set(Math.sin(state.angle), 0, Math.cos(state.angle));
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
    groundHuman(rig, state.p.y);
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
    } else if (state.walking < 0.2 && presentingHere) {
      // Aim in world space at this exhibit, then transform into the guide frame.
      // The hand extends along the same ray, not a fixed local "point right" pose.
      const shoulder = rig.bones.get("RightArm")!;
      shoulder.getWorldPosition(state.a);
      state.direction
        .copy(state.face)
        .sub(state.a)
        .normalize()
        .applyAxisAngle(state.up, -state.angle);
      const dx = state.direction.x,
        dy = state.direction.y,
        dz = state.direction.z;
      const presenting = 1 - state.walking;
      aim("RightArm", "RightForeArm", dx, dy - 0.25, dz, presenting);
      const elbow = rig.bones.get("RightForeArm")!;
      elbow.getWorldPosition(state.a);
      state.direction
        .copy(state.face)
        .sub(state.a)
        .normalize()
        .applyAxisAngle(state.up, -state.angle);
      aim(
        "RightForeArm",
        "RightHand",
        state.direction.x,
        state.direction.y,
        state.direction.z,
        presenting,
      );
      const hand = rig.bones.get("RightHand")!;
      elbow.getWorldPosition(state.a);
      hand.getWorldPosition(state.b);
      state.direction.copy(state.face).sub(state.a).normalize();
      gl.domElement.dataset.guideAim = state.b
        .sub(state.a)
        .normalize()
        .dot(state.direction)
        .toFixed(4);
    }
    state.b.set(state.p.x, state.p.y + 1, state.p.z).project(camera);
    gl.domElement.dataset.guideScreen = [state.b.x, state.b.y]
      .map((n) => n.toFixed(3))
      .join(",");
    gl.domElement.dataset.guideCameraDistance = Math.hypot(
      camera.position.x - state.p.x,
      camera.position.z - state.p.z,
    ).toFixed(3);
    gl.domElement.dataset.hostScale = rig.model.scale.x.toFixed(4);
    gl.domElement.dataset.guide = waving
      ? "waving"
      : state.walking > 0.5
        ? "walking"
        : presentingHere
          ? "presenting"
          : "standing";
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
