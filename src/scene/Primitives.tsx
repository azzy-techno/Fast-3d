import { useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3,
  Quaternion,
} from "three";
import type { Point } from "../data/chapters";
const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 16);
const materials = new Map<string, MeshStandardMaterial>();
function material(color: string, metal: number, glow: boolean) {
  const key = `${color}-${metal}-${glow}`;
  if (!materials.has(key))
    materials.set(
      key,
      new MeshStandardMaterial({
        color,
        metalness: metal,
        roughness: metal > 0.4 ? 0.34 : 0.7,
        emissive: glow ? color : "#000000",
        emissiveIntensity: glow ? 1.4 : 0,
      }),
    );
  return materials.get(key)!;
}
export function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  c = "#b1bdc5",
  metal = 0.25,
  glow = false,
  r = [0, 0, 0],
}: {
  p?: Point;
  s?: Point;
  c?: string;
  metal?: number;
  glow?: boolean;
  r?: Point;
}) {
  return (
    <mesh
      position={p}
      scale={s}
      rotation={r}
      geometry={box}
      material={material(c, metal, glow)}
      castShadow
      receiveShadow
    />
  );
}
export function Cylinder({
  p = [0, 0, 0],
  radius = 0.25,
  height = 1,
  c = "#7c94a4",
  r = [0, 0, 0],
  metal = 0.5,
}: {
  p?: Point;
  radius?: number;
  height?: number;
  c?: string;
  r?: Point;
  metal?: number;
}) {
  return (
    <mesh
      position={p}
      rotation={r}
      scale={[radius, height, radius]}
      geometry={cylinder}
      material={material(c, metal, false)}
      castShadow
      receiveShadow
    />
  );
}
export function Pipe({
  a,
  b,
  radius = 0.13,
  c = "#5ca5bd",
}: {
  a: Point;
  b: Point;
  radius?: number;
  c?: string;
}) {
  const { middle, length, quaternion } = useMemo(() => {
    const start = new Vector3(...a),
      end = new Vector3(...b),
      direction = end.clone().sub(start);
    return {
      middle: start.clone().add(end).multiplyScalar(0.5),
      length: direction.length(),
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.normalize(),
      ),
    };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <mesh
      geometry={cylinder}
      material={material(c, 0.55, false)}
      position={middle}
      quaternion={quaternion}
      scale={[radius, length, radius]}
      castShadow
    />
  );
}
export function Screen({
  p,
  s = [1.1, 0.65, 0.06],
  color = "#65d2e5",
}: {
  p: Point;
  s?: Point;
  color?: string;
}) {
  return (
    <group position={p}>
      <Box s={[s[0] + 0.15, s[1] + 0.15, 0.12]} c="#102336" />
      <Box p={[0, 0, 0.075]} s={s} c="#123d53" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          p={[-s[0] * 0.35 + i * s[0] * 0.17, -s[1] * 0.12, 0.115]}
          s={[s[0] * 0.08, s[1] * (0.2 + ((i * 3) % 5) * 0.12), 0.012]}
          c={color}
          glow
        />
      ))}
      <Box
        p={[0, s[1] * 0.34, 0.115]}
        s={[s[0] * 0.8, 0.025, 0.012]}
        c={color}
        glow
      />
    </group>
  );
}
export function Room({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <group>
      <Box p={[0, -0.3, 0]} s={[14, 0.5, 10]} c="#526374" />
      <Box p={[0, -0.03, 0]} s={[13.7, 0.04, 9.7]} c="#6b7b86" metal={0.1} />
      <Box p={[0, 2.4, -4.95]} s={[14, 4.8, 0.15]} c="#263f50" metal={0.1} />
      <Box p={[-6.95, 1.1, 0]} s={[0.15, 2.2, 10]} c="#344d5d" metal={0.1} />
      <Box p={[0, 0, 4.8]} s={[13.6, 0.05, 0.12]} c={color} glow />
      <Box p={[0, 0, -4.8]} s={[13.6, 0.05, 0.12]} c={color} glow />
      {[-6.5, 6.5].map((x) => (
        <group key={x}>
          <Box p={[x, 2.5, -4.5]} s={[0.22, 5, 0.22]} c="#8b9da8" />
          <Box p={[x, 5, -0.5]} s={[0.15, 0.15, 8]} c="#a5bac4" />
          <Box p={[x, 4.88, -0.5]} s={[0.05, 0.04, 7]} c="#c2e7ea" glow />
        </group>
      ))}
      <Box p={[0, 5, -4.5]} s={[13, 0.22, 0.22]} c="#8b9da8" />
      {children}
    </group>
  );
}
