import { useMemo, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  FileLoader,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,
  type BufferGeometry,
  type Material,
  Vector3,
} from "three";
import { assetUrl } from "../lib/assets";
export const WALK_STRIDE = 1.25;
export function useHumanRig(
  tint = "#526b85",
  height = 1.76,
  beard = false,
  variant = -1,
) {
  const logo = useTexture(assetUrl("fast-logo.png"));
  const { scene } = useGLTF(assetUrl("guide/host.glb"));
  const data = useLoader(FileLoader, assetUrl("guide/motion.json")) as string;
  const rig = useMemo(() => {
    const model = clone(scene);
    model.updateMatrixWorld(true);
    const originalBounds = new Box3().setFromObject(model);
    const hem =
      originalBounds.min.y +
      (originalBounds.max.y - originalBounds.min.y) *
        (variant < 0 ? 0.56 : 0.53 + (variant % 3) * 0.02);
    const bones = new Map<string, Bone>();
    const ownedMaterials: Material[] = [];
    const ownedGeometry: BufferGeometry[] = [];
    model.traverse((o) => {
      if (o instanceof Bone) bones.set(o.name.replace(/^mixamorig:?/, ""), o);
      if (o instanceof Mesh) {
        if (o.name.includes("Outfit_Top")) {
          // Shorten the source coat into workwear; edit the owned bind-pose mesh
          // so the hem and its shadow follow the existing skinning animation.
          o.geometry = o.geometry.clone();
          ownedGeometry.push(o.geometry);
          const index = o.geometry.index;
          const points = o.geometry.attributes.position;
          const heights: number[] = [];
          const v = new Vector3();
          for (let i = 0; i < points.count; i++) {
            o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld);
            heights.push(v.y);
          }
          const kept: number[] = [];
          const count = index?.count ?? points.count;
          for (let i = 0; i < count; i += 3) {
            const ids = [0, 1, 2].map((n) =>
              index ? index.getX(i + n) : i + n,
            );
            if (ids.some((id) => heights[id] >= hem)) kept.push(...ids);
          }
          o.geometry.setIndex(kept);
        }
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.name.includes("Headwear") || (!beard && o.name.includes("Beard")))
          o.visible = false;
        if (
          o.name.includes("Outfit") ||
          o.name.includes("Head") ||
          o.name.includes("Body")
        ) {
          const material = (
            Array.isArray(o.material) ? o.material[0] : o.material
          ).clone();
          if ("color" in material)
            (material as import("three").MeshStandardMaterial).color.set(tint);
          const surface = material as MeshStandardMaterial;
          if (o.name.includes("Outfit_Top")) {
            surface.map = null;
            surface.color.set(variant < 0 ? "#4d9ba9" : tint);
            surface.roughness = 0.88;
            surface.metalness = 0;
          } else if (o.name.includes("Outfit_Bottom")) {
            surface.map = null;
            surface.color.set(
              ["#243742", "#65777f", "#b5a087"][Math.max(0, variant) % 3],
            );
          } else if (o.name.includes("Head") || o.name.includes("Body")) {
            surface.color.set(
              [
                "#ffffff",
                "#c99c79",
                "#a2765d",
                "#e1ba96",
                "#795a48",
                "#edc8ab",
              ][Math.max(0, variant) % 6],
            );
          }
          if (o.name.includes("Body") && variant < 0)
            surface.color.set("#c69b84");
          o.material = material;
          ownedMaterials.push(material);
        }
      }
    });
    // Bone-mounted accessories move with the same skeleton and never slide off
    // during pointing, walking or lift travel.
    const attach = (
      bone: string,
      geometry: BufferGeometry,
      color: string,
      position: [number, number, number],
      scale: [number, number, number],
    ) => {
      const material = new MeshStandardMaterial({ color, roughness: 0.8 });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      bones.get(bone)?.add(mesh);
      ownedGeometry.push(geometry);
      ownedMaterials.push(material);
      return mesh;
    };
    const head = bones.get("Head");
    if (head)
      head.scale.set(
        variant < 0 ? 0.96 : 1 + ((variant % 3) - 1) * 0.07,
        1,
        variant % 2 ? 0.94 : 1,
      );
    if (variant < 0) {
      attach(
        "Head",
        new SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        "#eee9dc",
        [0, 0.165, 0.015],
        [0.115, 0.085, 0.13],
      );
      attach(
        "Head",
        new SphereGeometry(1, 24, 12),
        "#e1dac7",
        [0, 0.16, 0.035],
        [0.135, 0.012, 0.16],
      );
      const badge = new Mesh(
        new PlaneGeometry(0.145, 0.06),
        new MeshBasicMaterial({ map: logo, toneMapped: false }),
      );
      badge.position.set(-0.095, 0.085, 0.205);
      bones.get("Spine2")?.add(badge);
      ownedGeometry.push(badge.geometry);
      ownedMaterials.push(badge.material);
      attach(
        "Spine2",
        new BoxGeometry(0.34, 0.018, 0.006),
        "#d2e6b8",
        [0, -0.08, 0.17],
        [1, 1, 1],
      );
    } else {
      const hair = [
        "#2b211c",
        "#4c3025",
        "#171918",
        "#8e6b44",
        "#29201d",
        "#533d2e",
      ][variant % 6];
      attach(
        "Head",
        new SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        hair,
        [0, 0.155, 0],
        [0.104, 0.06 + (variant % 3) * 0.018, 0.115],
      );
      if (variant % 3 === 1)
        attach(
          "Head",
          new SphereGeometry(1, 16, 12),
          hair,
          [0, 0.12, -0.09],
          [0.1, 0.11, 0.055],
        );
      if (variant % 3 === 2) {
        attach(
          "Spine2",
          new BoxGeometry(0.26, 0.34, 0.13),
          "#9b7455",
          [0, -0.08, -0.17],
          [1, 1, 1],
        );
        for (const x of [-0.11, 0.11])
          attach(
            "Spine2",
            new BoxGeometry(0.025, 0.3, 0.025),
            "#584b41",
            [x, -0.05, 0.14],
            [1, 1, 1],
          );
      }
    }
    const standing = new Map<string, import("three").Quaternion>();
    for (const name of [
      "Hips",
      "LeftUpLeg",
      "LeftLeg",
      "LeftFoot",
      "LeftToeBase",
      "RightUpLeg",
      "RightLeg",
      "RightFoot",
      "RightToeBase",
    ]) {
      const bone = bones.get(name);
      if (bone) standing.set(name, bone.quaternion.clone());
    }
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const scale = height / (bounds.max.y - bounds.min.y);
    model.scale.setScalar(scale);
    model.position.y = -bounds.min.y * scale;
    const mixer = new AnimationMixer(model);
    const clips = (
      JSON.parse(data) as Parameters<typeof AnimationClip.parse>[0][]
    ).map((c) => AnimationClip.parse(c));
    const walk = mixer.clipAction(clips.find((c) => c.name === "Walk")!).play();
    const idle = mixer.clipAction(clips.find((c) => c.name === "Idle")!).play();
    return {
      model,
      bones,
      mixer,
      walk,
      idle,
      ownedMaterials,
      ownedGeometry,
      standing,
    };
  }, [scene, data, tint, height, beard, variant, logo]);
  useEffect(
    () => () => {
      rig.mixer.stopAllAction();
      rig.mixer.uncacheRoot(rig.model);
      rig.ownedGeometry.forEach((g) => g.dispose());
      rig.ownedMaterials.forEach((m) => m.dispose());
    },
    [rig],
  );
  return rig;
}
const foot = new Vector3();
export function groundHuman(
  rig: ReturnType<typeof useHumanRig>,
  floor: number,
) {
  let lowest = Infinity;
  for (const name of ["LeftFoot", "RightFoot", "LeftToeBase", "RightToeBase"]) {
    const bone = rig.bones.get(name);
    if (bone) lowest = Math.min(lowest, bone.getWorldPosition(foot).y);
  }
  if (Number.isFinite(lowest)) rig.model.position.y += floor + 0.045 - lowest;
  rig.model.updateMatrixWorld(true);
}

export function standHuman(
  rig: ReturnType<typeof useHumanRig>,
  amount: number,
) {
  for (const [name, quaternion] of rig.standing)
    rig.bones.get(name)!.quaternion.slerp(quaternion, amount);
}
