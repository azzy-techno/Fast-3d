import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";

function ExhibitMesh({ name }: { name: string }) {
  const { nodes } = useGLTF(assetUrl("electrical/exhibits.glb"));
  const model = useMemo(() => {
    const instance = nodes[name].clone();
    instance.traverse((part) => {
      if (part instanceof Mesh) part.castShadow = part.receiveShadow = true;
    });
    return instance;
  }, [name, nodes]);
  return <primitive object={model} />;
}

function Impeller() {
  const shaft = useRef<Group>(null);
  const reduced = useMemo(
    () => matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  useFrame((_, dt) => {
    if (
      shaft.current &&
      !reduced.matches &&
      journeyState.progress >= 1.94 &&
      journeyState.progress < 2.84
    )
      shaft.current.rotation.z += Math.min(dt, 0.1) * 1.8;
  });
  return (
    <group position={[0, 1.65, 0]} ref={shaft} userData={{ dynamic: true }}>
      <ExhibitMesh name="Impeller" />
    </group>
  );
}

export function ElectricalStationModel({ number }: { number: number }) {
  return (
    <>
      <ExhibitMesh name={`Exhibit${String(number).padStart(2, "0")}`} />
      {number === 16 && <Impeller />}
    </>
  );
}
