import { useMemo, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  FileLoader,
  Mesh,
  type Material,
  Vector3,
} from "three";
import { assetUrl } from "../lib/assets";
export const WALK_STRIDE = 1.25;
export function useHumanRig(tint = "#526b85", height = 1.76, beard = true) {
  const { scene } = useGLTF(assetUrl("guide/host.glb"));
  const data = useLoader(FileLoader, assetUrl("guide/motion.json")) as string;
  const rig = useMemo(() => {
    const model = clone(scene);
    const bones = new Map<string, Bone>();
    const ownedMaterials: Material[] = [];
    model.traverse((o) => {
      if (o instanceof Bone) bones.set(o.name.replace(/^mixamorig:?/, ""), o);
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.name.includes("Headwear") || (!beard && o.name.includes("Beard")))
          o.visible = false;
        if (o.name.includes("Outfit")) {
          const material = (
            Array.isArray(o.material) ? o.material[0] : o.material
          ).clone();
          if ("color" in material)
            (material as import("three").MeshStandardMaterial).color.set(tint);
          o.material = material;
          ownedMaterials.push(material);
        }
      }
    });
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
    return { model, bones, mixer, walk, idle, ownedMaterials, standing };
  }, [scene, data, tint, height, beard]);
  useEffect(
    () => () => {
      rig.mixer.stopAllAction();
      rig.mixer.uncacheRoot(rig.model);
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
