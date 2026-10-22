import { useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3,
  Quaternion,
  CanvasTexture,
  SRGBColorSpace,
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
const dashboardTextures = new Map<string, CanvasTexture>();
function dashboardTexture(color: string) {
  if (dashboardTextures.has(color)) return dashboardTextures.get(color)!;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#132b36";
  ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = "#1d3b46";
  ctx.fillRect(0, 0, 512, 52);
  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "#d3ded9";
  ctx.fillText("FAST / SYSTEM OVERVIEW", 20, 32);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(476, 26, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#9aafb2";
  ctx.fillText("OPERATING SEQUENCE", 22, 82);
  ctx.fillText("CONNECTED", 368, 82);
  ctx.strokeStyle = "#31505a";
  ctx.lineWidth = 1;
  for (let y = 110; y < 235; y += 30) {
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(490, y);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 22; x < 490; x += 4) {
    const y = 170 + Math.sin(x * 0.025) * 30 + Math.cos(x * 0.073) * 11;
    if (x === 22) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const x = 22 + i * 158;
    ctx.fillStyle = "#203e46";
    ctx.fillRect(x, 252, 144, 46);
    ctx.fillStyle = color;
    ctx.fillRect(x + 10, 263, 4, 24);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#a9b9b8";
    ctx.fillText(["POWER", "FLOW", "NETWORK"][i], x + 23, 269);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#e2e7df";
    ctx.fillText("SEQUENCE ACTIVE", x + 23, 287);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  dashboardTextures.set(color, texture);
  return texture;
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
  const map = useMemo(() => dashboardTexture(color), [color]);
  return (
    <group position={p}>
      <Box s={[s[0] + 0.12, s[1] + 0.12, 0.12]} c="#152b34" />
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[s[0], s[1]]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
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
