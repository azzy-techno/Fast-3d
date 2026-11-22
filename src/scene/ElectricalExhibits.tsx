import { mechanicalStations } from "../data/mechanical";
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

function nearMechanicalStation(number: number) {
  const station = mechanicalStations[number - 1];
  return (
    journeyState.progress >= station.at - 0.01 &&
    journeyState.progress <= station.end + 0.01
  );
}

function IntakeDamper() {
  const blades = useRef<Group>(null);
  const phase = useRef(0);
  const reduced = useMemo(
    () => matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  useFrame((_, dt) => {
    if (!blades.current || !nearMechanicalStation(12) || reduced.matches)
      return;
    phase.current += Math.min(dt, 0.1);
    const tilt = 0.7 + 0.46 * Math.sin(phase.current * 0.8);
    for (const blade of blades.current.children) blade.rotation.x = tilt;
  });
  return (
    <group ref={blades} userData={{ dynamic: true }}>
      {[1.35, 1.78, 2.2].map((y) => (
        <group key={y} rotation={[0.7, 0, 0]} position={[1.35, y, 0.05]}>
          <ExhibitMesh mechanical name="DamperBlade" />
        </group>
      ))}
    </group>
  );
}

function Impeller({
  mechanical,
  number,
}: {
  mechanical: boolean;
  number: number;
}) {
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
        ? nearMechanicalStation(number)
        : journeyState.progress >= 1.94 && journeyState.progress < 2.84)
    )
      shaft.current.rotation.z += Math.min(dt, 0.1) * 1.8;
  });
  return (
    <group
      position={
        number === 13
          ? [1.39, 1.37, 0.5]
          : mechanical
            ? [1.49, 1.51, 0.37]
            : [0, 1.65, 0]
      }
      scale={number === 13 ? 0.57 / 0.91 : 1}
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
      {(mechanical ? number === 3 || number === 13 : number === 16) && (
        <Impeller mechanical={mechanical} number={number} />
      )}
      {mechanical && number === 12 && <IntakeDamper />}
    </>
  );
}
