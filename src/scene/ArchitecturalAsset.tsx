import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh } from "three";
import { assetUrl } from "../lib/assets";
import type { Point } from "../data/chapters";

export function ArchitecturalAsset({
  name,
  position,
  scale,
}: {
  name:
    "tower-brise-soleil" | "gallery-alcove" | "fan-guard" | "induction-motor";
  position?: Point;
  scale?: Point;
}) {
  const { scene } = useGLTF(assetUrl("architecture/" + name + ".glb"));
  const model = useMemo(() => {
    const instance = scene.clone();
    instance.traverse((object) => {
      if (object instanceof Mesh)
        object.castShadow = object.receiveShadow = true;
    });
    return instance;
  }, [scene]);
  return <primitive object={model} position={position} scale={scale} />;
}
