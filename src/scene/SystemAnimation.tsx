import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Color,
  Group,
  InstancedMesh,
  Object3D,
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { journeyState } from "./journey";
import type { Point } from "../data/chapters";

function circuit(index: number): Point[] {
  if (index === 1)
    return [
      [-5.5, 4.75, -1.4],
      [0, 4.75, -1.4],
      [4.5, 4.75, -1.4],
      [4.5, 2.8, -0.4],
      [0, 2.8, -0.4],
      [-4.5, 2.8, -0.4],
    ];
  if (index === 2 || index === 5)
    return [
      [-4.5, 4, -2.5],
      [-4.5, 2.6, -2.5],
      [-4.5, 2.6, 0.7],
      [0, 2.6, 0.7],
      [4.35, 2.6, 0.7],
      [4.35, 1.7, 0.7],
    ];
  if (index === 6)
    return [
      [-5.5, 4.65, -1],
      [-3, 4.65, -1],
      [0, 4.65, -1],
      [3, 4.65, -1],
      [4.4, 4.65, -1],
      [4.4, 0.5, 0.1],
    ];
  if (index === 9)
    return [
      [-3.4, 1.8, 1],
      [-3.4, 3.2, 1],
      [0, 3.2, 0],
      [4.5, 3.2, -1.5],
      [4.5, 2.6, -0.9],
    ];
  return [
    [-5.4, 0.06, 3.6],
    [-5.4, 0.06, -3.8],
    [0, 0.06, -3.8],
    [5.4, 0.06, -3.8],
    [5.4, 0.06, 3.6],
  ];
}
export function SystemAnimation({
  index,
  color,
}: {
  index: number;
  color: string;
}) {
  const particles = useRef<InstancedMesh>(null),
    sweep = useRef<Mesh>(null),
    sparks = useRef<InstancedMesh>(null);
  const position = useMemo(() => new Vector3(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        circuit(index).map((p) => new Vector3(...p)),
        false,
        "catmullrom",
        0.06,
      ),
    [index],
  );
  const line = useMemo(() => {
    const points = curve.getPoints(80),
      g = new BufferGeometry();
    g.setAttribute(
      "position",
      new Float32BufferAttribute(
        points.flatMap((p) => p.toArray()),
        3,
      ),
    );
    return g;
  }, [curve]);
  useEffect(() => () => line.dispose(), [line]);
  useFrame(({ clock }) => {
    if (Math.abs(journeyState.progress - (index + 1)) > 1.3) return;
    const t = clock.elapsedTime;
    if (particles.current) {
      for (let i = 0; i < 18; i++) {
        curve.getPoint((t * 0.07 + i / 18) % 1, position);
        dummy.position.copy(position);
        dummy.scale.setScalar(i % 3 === 0 ? 0.07 : 0.035);
        dummy.updateMatrix();
        particles.current.setMatrixAt(i, dummy.matrix);
      }
      particles.current.instanceMatrix.needsUpdate = true;
    }
    if (sweep.current) {
      sweep.current.position.y =
        index === 4
          ? 0.3 + ((t * 0.42) % 4)
          : 1.45 + (Math.sin(t * 0.7) * 0.5 + 0.5) * 1.8;
      (sweep.current.material as MeshBasicMaterial).opacity =
        0.04 + Math.sin(t * 1.3) ** 2 * 0.05;
    }
    if (sparks.current) {
      for (let i = 0; i < 28; i++) {
        const age = (t * 1.9 + i * 0.137) % 1;
        const a = i * 2.4;
        dummy.position.set(
          1.8 + Math.cos(a) * age * 1.4,
          1.9 + Math.sin(i * 1.7) * age - 1.4 * age * age,
          2.4 + Math.sin(a) * age,
        );
        dummy.scale.set(0.012, (1 - age) * 0.16, 0.012);
        dummy.rotation.set(a, 0, a);
        dummy.updateMatrix();
        sparks.current.setMatrixAt(i, dummy.matrix);
      }
      sparks.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group name={`system-animation-${index}`}>
      <lineSegments geometry={line}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </lineSegments>
      <instancedMesh
        ref={particles}
        args={[undefined, undefined, 18]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial
          color={new Color(color).multiplyScalar(1.5)}
          toneMapped={false}
        />
      </instancedMesh>
      {(index === 4 || index === 10) && (
        <mesh ref={sweep} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.06}
            depthWrite={false}
            side={2}
          />
        </mesh>
      )}
      {index === 3 && (
        <instancedMesh
          ref={sparks}
          args={[undefined, undefined, 28]}
          frustumCulled={false}
        >
          <boxGeometry />
          <meshBasicMaterial color="#ffd7a0" toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
}
