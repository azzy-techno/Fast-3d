import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";

function ExhibitMesh({
  name,
  mechanical = false,
}: {
  name: string;
  mechanical?: boolean;
}) {
  const { nodes } = useGLTF(
    assetUrl(
      mechanical ? "mechanical/exhibits.glb" : "electrical/exhibits.glb",
    ),
  );
  const model = useMemo(() => {
    const instance = nodes[name].clone();
    instance.traverse((part) => {
      if (part instanceof Mesh) part.castShadow = part.receiveShadow = true;
    });
    return instance;
  }, [name, nodes]);
  return <primitive object={model} />;
}

function Impeller({ mechanical }: { mechanical: boolean }) {
  const shaft = useRef<Group>(null);
  const reduced = useMemo(
    () => matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  useFrame((_, dt) => {
    if (
      shaft.current &&
      !reduced.matches &&
      (mechanical
        ? journeyState.progress >= 3.18 && journeyState.progress < 3.24
        : journeyState.progress >= 1.94 && journeyState.progress < 2.84)
    )
      shaft.current.rotation.z += Math.min(dt, 0.1) * 1.8;
  });
  return (
    <group
      position={mechanical ? [1.49, 1.51, 0.37] : [0, 1.65, 0]}
      ref={shaft}
      userData={{ dynamic: true }}
    >
      <ExhibitMesh mechanical={mechanical} name="Impeller" />
    </group>
  );
}

export function ElectricalStationModel({
  number,
  mechanical = false,
}: {
  number: number;
  mechanical?: boolean;
}) {
  return (
    <>
      <ExhibitMesh
        mechanical={mechanical}
        name={`Exhibit${String(number).padStart(2, "0")}`}
      />
      {number === (mechanical ? 3 : 16) && <Impeller mechanical={mechanical} />}
    </>
  );
}
