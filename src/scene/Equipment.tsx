import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Group } from "three";
import { Box, Cylinder, Pipe, Screen } from "./Primitives";
import type { Point } from "../data/chapters";

function Label({
  text,
  p,
  width = 1.3,
}: {
  text: string;
  p: Point;
  width?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#15344a";
    ctx.fillRect(0, 0, 512, 96);
    ctx.font = "600 40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c9e6ee";
    ctx.fillText(text, 256, 48);
    return new CanvasTexture(canvas);
  }, [text]);
  return (
    <mesh position={p}>
      <planeGeometry args={[width, (width * 96) / 512]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
function Fan({ p, radius = 1 }: { p: Point; radius?: number }) {
  const blades = useRef<Group>(null);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.y += Math.min(dt, 0.05) * 2;
  });
  return (
    <group position={p}>
      <Cylinder radius={radius} height={0.4} c="#d5dce0" />
      <Cylinder
        p={[0, 0.21, 0]}
        radius={radius * 0.87}
        height={0.05}
        c="#142d3d"
      />
      <group ref={blades} position={[0, 0.27, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
            <Box
              p={[radius * 0.42, 0, 0]}
              s={[radius * 0.72, 0.045, 0.22]}
              r={[0.2, 0, 0.1]}
              c="#91a8b3"
            />
          </group>
        ))}
        <Cylinder radius={0.18} height={0.12} c="#cbd5d9" />
      </group>
    </group>
  );
}
function Motor({ p, c = "#2f88b0" }: { p: Point; c?: string }) {
  return (
    <group position={p}>
      <Box p={[0, 0.13, 0]} s={[1.8, 0.25, 1.25]} c="#b6c1c6" />
      <Cylinder
        p={[-0.3, 0.7, 0]}
        radius={0.5}
        height={1.25}
        r={[0, 0, Math.PI / 2]}
        c={c}
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Cylinder
          key={i}
          p={[-0.8 + i * 0.16, 0.7, 0]}
          radius={0.56}
          height={0.035}
          r={[0, 0, Math.PI / 2]}
          c={c}
        />
      ))}
      <Cylinder
        p={[0.55, 0.7, 0]}
        radius={0.23}
        height={0.45}
        r={[0, 0, Math.PI / 2]}
        c="#c7cfd1"
      />
      <Cylinder
        p={[0.95, 0.7, 0]}
        radius={0.64}
        height={0.48}
        r={[0, 0, Math.PI / 2]}
        c={c}
      />
      <Pipe a={[0.95, 0.9, 0]} b={[0.95, 1.7, 0]} c={c} radius={0.2} />
    </group>
  );
}
function Valve({ p, c = "#ba4439" }: { p: Point; c?: string }) {
  return (
    <group position={p}>
      <Cylinder radius={0.16} height={0.45} c="#b2c1c9" />
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.045, 8, 20]} />
        <meshStandardMaterial color={c} />
      </mesh>
      <Box p={[0, 0.28, 0]} s={[0.68, 0.04, 0.04]} c={c} />
      <Box p={[0, 0.28, 0]} s={[0.04, 0.04, 0.68]} c={c} />
    </group>
  );
}
export function Cooling() {
  return (
    <group>
      {[-3.6, 0, 3.6].map((x, i) => (
        <group key={x} position={[x, 0, -0.8]}>
          <Box p={[0, 0.25, 0]} s={[3.15, 0.5, 3.8]} c="#778e9c" />
          <Box p={[0, 1.7, 0]} s={[2.9, 2.6, 3.5]} c="#b8c6cd" />
          <Box p={[0, 1.65, 1.78]} s={[2.55, 1.8, 0.06]} c="#253f4d" />
          {Array.from({ length: 9 }, (_, n) => (
            <Box
              key={n}
              p={[0, 0.9 + n * 0.19, 1.83]}
              s={[2.55, 0.075, 0.08]}
              c="#97aeb9"
            />
          ))}
          <Fan p={[0, 3.14, 0]} radius={1.25} />
          <Label text={`CT — 0${i + 1}`} p={[0, 2.77, 1.82]} />
          <Pipe a={[1.38, 1, 0]} b={[1.38, 1, 3.4]} radius={0.19} />
          <Valve p={[1.38, 1.1, 2.6]} />
        </group>
      ))}
      <Pipe a={[-5.5, 1, 3.4]} b={[5.5, 1, 3.4]} radius={0.23} />
      <Pipe a={[-5.5, 1, 3.4]} b={[-5.5, 0, 3.4]} radius={0.23} />
      <Pipe a={[-5.7, 0, -3]} b={[-5.7, 0, 3]} c="#babfc3" radius={0.05} />
      {[-5.9, 5.9].map((x) => (
        <group key={x}>
          {[-4, -2, 0, 2, 4].map((z) => (
            <Pipe
              key={z}
              a={[x, 0, z]}
              b={[x, 1.2, z]}
              c="#a7bbc4"
              radius={0.04}
            />
          ))}
          <Pipe a={[x, 1.2, -4]} b={[x, 1.2, 4]} c="#a7bbc4" radius={0.05} />
        </group>
      ))}
    </group>
  );
}
export function Electrical() {
  return (
    <group>
      {[-4.4, -2.2, 0, 2.2, 4.4].map((x, i) => (
        <group key={x} position={[x, 0, -1.4]}>
          <Box
            p={[0, 2.1, 0]}
            s={[2, 4.2, 1.5]}
            c={i === 2 ? "#5486a2" : "#c0c9ce"}
          />
          <Box p={[0, 2.1, 0.77]} s={[1.85, 3.95, 0.035]} c="#9dabb4" />
          <Screen p={[0, 3, 0.82]} s={[1, 0.6, 0.03]} color="#8fdcc0" />
          <Box p={[0.65, 1.8, 0.86]} s={[0.06, 0.45, 0.1]} c="#1b3141" />
          {[-0.35, 0, 0.35].map((a, k) => (
            <Box
              key={a}
              p={[a, 2.35, 0.84]}
              s={[0.11, 0.11, 0.06]}
              c={k === 1 ? "#e7b550" : "#79c6a4"}
              glow
            />
          ))}
          {Array.from({ length: 5 }, (_, n) => (
            <Box
              key={n}
              p={[0, 0.5 + n * 0.13, 0.8]}
              s={[1.3, 0.04, 0.03]}
              c="#415665"
            />
          ))}
          <Label
            text={i === 2 ? "MAIN INCOMING" : `LV PANEL 0${i + 1}`}
            p={[0, 3.9, 0.8]}
            width={1.5}
          />
          <Pipe
            a={[x * 0.03, 4.2, 0]}
            b={[x * 0.03, 4.7, 0]}
            c="#d3ac5f"
            radius={0.09}
          />
        </group>
      ))}
      <Box p={[0, 4.7, -1.4]} s={[11.5, 0.2, 0.8]} c="#c1b58d" />
      <Box p={[0, 0.02, 2.8]} s={[10, 0.02, 0.08]} c="#edc66f" />
      <Box p={[0, 0.02, 1.8]} s={[10, 0.02, 0.08]} c="#edc66f" />
    </group>
  );
}
export function Mechanical({ red = false }: { red?: boolean }) {
  const color = red ? "#b94235" : "#3586ac";
  return (
    <group>
      {[-3.4, 0, 3.4].map((x, i) => (
        <group key={x} position={[x, 0, 0.7]}>
          <Motor p={[0, 0, 0]} c={color} />
          <Pipe a={[0.95, 1.7, 0]} b={[0.95, 2.6, 0]} c={color} radius={0.22} />
          <Valve p={[0.95, 2.65, 0]} c={red ? "#222d39" : "#c5483b"} />
          <Label
            text={red ? `FIRE PUMP 0${i + 1}` : `PUMP 0${i + 1}`}
            p={[0, 0.3, 1]}
          />
        </group>
      ))}
      <Pipe a={[-4.5, 2.6, 0.7]} b={[5.2, 2.6, 0.7]} c={color} radius={0.3} />
      <Pipe a={[-4.5, 2.6, 0.7]} b={[-4.5, 2.6, -2.5]} c={color} radius={0.3} />
      <Pipe a={[-4.5, 2.6, -2.5]} b={[-4.5, 4, -2.5]} c={color} radius={0.3} />
      {[-2.8, 0.1, 3].map((x) => (
        <group key={x}>
          <Cylinder
            p={[x, 1.8, -2.8]}
            radius={red ? 0.58 : 1}
            height={3.5}
            c={red ? "#b94b40" : "#b6c4cc"}
          />
          <Cylinder
            p={[x, 3.58, -2.8]}
            radius={red ? 0.6 : 1.02}
            height={0.12}
            c="#778e9b"
          />
          <Pipe a={[x, 3.6, -2.8]} b={[x, 4.2, -2.8]} c={color} radius={0.15} />
          <Pipe
            a={[x, 4.2, -2.8]}
            b={[5.3, 4.2, -2.8]}
            c={color}
            radius={0.15}
          />
        </group>
      ))}
      {red && (
        <>
          <Box p={[5.6, 1.5, 2.2]} s={[0.9, 3, 0.7]} c="#b43c32" />
          <Screen p={[5.6, 2.3, 2.57]} s={[0.55, 0.4, 0.04]} />
          <Label text="FIRE CONTROL" p={[5.6, 1.6, 2.58]} width={0.8} />
        </>
      )}
    </group>
  );
}
function Beam({
  p,
  length = 6,
  r = [0, 0, 0],
  c = "#8b9eaa",
}: {
  p: Point;
  length?: number;
  r?: Point;
  c?: string;
}) {
  return (
    <group position={p} rotation={r}>
      <Box s={[length, 0.55, 0.12]} c={c} />
      <Box p={[0, 0.3, 0]} s={[length, 0.1, 0.65]} c={c} />
      <Box p={[0, -0.3, 0]} s={[length, 0.1, 0.65]} c={c} />
    </group>
  );
}
export function Fabrication() {
  return (
    <group>
      {[-5, 5].map((x) => (
        <group key={x}>
          <Beam
            p={[x, 2.5, -2]}
            length={5}
            r={[0, 0, Math.PI / 2]}
            c="#d09a48"
          />
          <Beam
            p={[x, 4.9, 0]}
            length={7}
            r={[0, Math.PI / 2, 0]}
            c="#d09a48"
          />
        </group>
      ))}
      <Beam p={[0, 5.15, -1.5]} length={11} c="#d8a34c" />
      <Box p={[1.5, 4.7, -1.5]} s={[1.2, 0.65, 1]} c="#343f49" />
      <Pipe
        a={[1.5, 4.5, -1.5]}
        b={[1.5, 2.4, -1.5]}
        radius={0.035}
        c="#cad0d3"
      />
      <Cylinder p={[1.5, 2.1, -1.5]} radius={0.24} height={0.3} c="#b0b9be" />
      {[-2.8, -1.6, -0.4].map((z) => (
        <Beam key={z} p={[-1, 0.5, z]} length={7} />
      ))}
      <Box p={[1.5, 1, 2.3]} s={[3.7, 0.25, 1.9]} c="#a6b2b6" />
      {[-0.1, 3.1].map((x) => (
        <Box key={x} p={[x, 0.5, 2.3]} s={[0.14, 1, 1.5]} c="#687e8b" />
      ))}
      <Box p={[1.5, 1.5, 2.3]} s={[1.5, 0.75, 1.1]} c="#9cabb1" />
      <Box p={[4.8, 0.8, 2.6]} s={[1, 1.6, 0.9]} c="#2c6e8d" />
      <Pipe a={[4.8, 1.6, 2.6]} b={[2.2, 1.9, 2.3]} c="#1a2836" radius={0.06} />
      <Label text="FAST FABRICATION" p={[0, 5.17, -1.13]} width={3} />
    </group>
  );
}
export function Civil() {
  return (
    <group>
      <Box p={[0, -0.6, 0]} s={[12, 0.8, 8]} c="#8e8472" />
      {[-4, 0, 4].flatMap((x) =>
        [-2.7, 2.7].map((z) => (
          <group key={`${x}-${z}`}>
            <Box p={[x, 0.25, z]} s={[2.5, 0.65, 2.5]} c="#adb3ae" metal={0} />
            <Box p={[x, 1.9, z]} s={[0.9, 3, 0.9]} c="#b6bdb8" metal={0} />
            {[-0.25, 0.25].flatMap((a) =>
              [-0.25, 0.25].map((b) => (
                <Pipe
                  key={`${a}-${b}`}
                  a={[x + a, 3.4, z + b]}
                  b={[x + a, 4.5, z + b]}
                  radius={0.035}
                  c="#625c4a"
                />
              )),
            )}
          </group>
        )),
      )}
      <Box p={[0, 3.3, -2.7]} s={[9, 0.6, 1]} c="#b8c0bb" metal={0} />
      <Box p={[-4, 3.3, 0]} s={[1, 0.6, 6.2]} c="#b8c0bb" metal={0} />
      <Box p={[4, 3.3, 0]} s={[1, 0.6, 6.2]} c="#b8c0bb" metal={0} />
      {Array.from({ length: 13 }, (_, i) => (
        <Pipe
          key={i}
          a={[-5.5 + i * 0.9, 0.02, -3.9]}
          b={[-5.5 + i * 0.9, 0.02, 3.9]}
          radius={0.022}
          c="#354f57"
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Pipe
          key={i}
          a={[-5.7, 0.04, -3.6 + i * 0.9]}
          b={[5.7, 0.04, -3.6 + i * 0.9]}
          radius={0.022}
          c="#354f57"
        />
      ))}
    </group>
  );
}
export function Servers() {
  return (
    <group>
      {[-4.4, -2.2, 0, 2.2, 4.4].map((x, j) => (
        <group key={x} position={[x, 0, -1]}>
          <Box p={[0, 2.1, 0]} s={[1.85, 4.2, 1.9]} c="#152a3a" />
          <Box p={[0, 2.1, 0.96]} s={[1.65, 3.9, 0.06]} c="#253e51" />
          {Array.from({ length: 11 }, (_, i) => (
            <group key={i}>
              <Box
                p={[0, 0.5 + i * 0.29, 1.01]}
                s={[1.45, 0.21, 0.06]}
                c="#435965"
              />
              <Box
                p={[-0.5, 0.5 + i * 0.29, 1.05]}
                s={[0.06, 0.045, 0.03]}
                c={(i + j) % 3 ? "#64cfbb" : "#60b7e6"}
                glow
              />
              <Box
                p={[-0.34, 0.5 + i * 0.29, 1.05]}
                s={[0.06, 0.045, 0.03]}
                c="#6dc7d8"
                glow
              />
              <Box
                p={[0.27, 0.5 + i * 0.29, 1.05]}
                s={[0.52, 0.05, 0.025]}
                c="#142c3e"
              />
            </group>
          ))}
          <Label
            text={`FAST / NETWORK 0${j + 1}`}
            p={[0, 3.9, 1.01]}
            width={1.55}
          />
          <Pipe a={[0, 4.2, 0]} b={[0, 4.6, 0]} c="#4f94ba" radius={0.06} />
        </group>
      ))}
      <Box p={[0, 4.6, -1]} s={[11, 0.12, 1.1]} c="#7e969f" />
      <Box p={[0, 0.01, 2.5]} s={[11, 0.02, 0.1]} c="#76c6df" glow />
    </group>
  );
}
function Conveyor({ vision = false }: { vision?: boolean }) {
  const goods = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (goods.current)
      goods.current.position.x = ((clock.elapsedTime * 0.3) % 2) - 1;
  });
  return (
    <group>
      <Box p={[0, 1.1, 1]} s={[10, 0.22, 2.1]} c="#172f3d" />
      {Array.from({ length: 25 }, (_, i) => (
        <Cylinder
          key={i}
          p={[-4.8 + i * 0.4, 1.28, 1]}
          radius={0.12}
          height={1.9}
          r={[Math.PI / 2, 0, 0]}
          c="#92a3aa"
        />
      ))}
      {[-4, 0, 4].map((x) => (
        <Box key={x} p={[x, 0.55, 1]} s={[0.2, 1.1, 1.8]} c="#9cabb2" />
      ))}
      {[-0.15, 2.15].map((z) => (
        <Box key={z} p={[0, 1.4, z]} s={[10, 0.24, 0.1]} c="#7a94a1" />
      ))}
      <group ref={goods}>
        {[-3, 0, 3].map((x) => (
          <group key={x}>
            <Box p={[x, 1.9, 1]} s={[1.15, 1, 1.2]} c="#ba9e75" metal={0} />
            <Box p={[x, 2.41, 1]} s={[0.15, 0.02, 1.22]} c="#d6bf94" />
          </group>
        ))}
      </group>
      {vision && (
        <group>
          {[-1.5, 1.5].map((z) => (
            <Box
              key={z}
              p={[0.8, 2.25, z + 1]}
              s={[0.18, 4.5, 0.18]}
              c="#b1bfc5"
            />
          ))}
          <Box p={[0.8, 4.5, 1]} s={[0.2, 0.2, 3.3]} c="#b1bfc5" />
          <Box p={[0.8, 4.15, 1]} s={[0.8, 0.5, 0.6]} c="#e8e7d9" />
          <Cylinder p={[0.8, 3.8, 1]} radius={0.15} height={0.3} c="#253d4c" />
          <Box p={[0.8, 1.42, 1]} s={[0.03, 0.02, 1.8]} c="#75e4af" glow />
          <Box p={[3.6, 2.8, -2.5]} s={[0.14, 3, 0.14]} c="#9aabb4" />
          <Screen p={[3.6, 3, -2.3]} s={[2.1, 1.3, 0.05]} color="#83dfad" />
          <Label text="VISION / INSPECTION" p={[0.8, 4.52, 2.68]} width={2} />
        </group>
      )}
    </group>
  );
}
function Robot({ p, mirrored = false }: { p: Point; mirrored?: boolean }) {
  const arm = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (arm.current)
      arm.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.4) * 0.24 + (mirrored ? Math.PI : 0);
  });
  const c = "#e0a346";
  return (
    <group position={p}>
      <Box p={[0, 0.15, 0]} s={[1.8, 0.3, 1.8]} c="#526879" />
      <Cylinder p={[0, 0.6, 0]} radius={0.62} height={0.8} c={c} />
      <group ref={arm} position={[0, 0.9, 0]}>
        <Cylinder
          p={[0, 0.1, 0]}
          radius={0.48}
          height={0.55}
          r={[Math.PI / 2, 0, 0]}
          c="#6c7f88"
        />
        <Box
          p={[0.45, 1.05, 0]}
          s={[0.55, 2.2, 0.55]}
          r={[0, 0, -0.45]}
          c={c}
        />
        <Cylinder
          p={[0.9, 2, 0]}
          radius={0.38}
          height={0.65}
          r={[Math.PI / 2, 0, 0]}
          c="#6c7f88"
        />
        <Box p={[1.6, 1.95, 0]} s={[1.6, 0.4, 0.4]} r={[0, 0, -0.1]} c={c} />
        <Box p={[2.35, 1.65, 0]} s={[0.25, 0.6, 0.35]} c="#c0c9cc" />
        {[-0.22, 0.22].map((z) => (
          <Box key={z} p={[2.35, 1.35, z]} s={[0.15, 0.45, 0.08]} c="#1c3545" />
        ))}
      </group>
    </group>
  );
}
export function Manufacturing() {
  return (
    <group>
      <Conveyor />
      <Robot p={[-3, 0, -2.4]} />
      <Robot p={[3.2, 0, -2.4]} mirrored />
      <Box p={[-5.6, 1.4, -2.5]} s={[1, 2.8, 1]} c="#a8b8c0" />
      <Screen p={[-5.6, 2, -1.97]} s={[0.7, 0.6, 0.04]} />
      <Label text="CONNECTED PRODUCTION" p={[0, 0.7, 2.15]} width={2.7} />
    </group>
  );
}
export function ControlRoom() {
  return (
    <group>
      <Box p={[0, 2.5, -2.9]} s={[11, 4.8, 0.3]} c="#182e3e" />
      {[-3.5, 0, 3.5].flatMap((x) =>
        [1.4, 3.4].map((y) => (
          <Screen
            key={`${x}-${y}`}
            p={[x, y, -2.68]}
            s={[3.1, 1.65, 0.04]}
            color={x === 0 ? "#81d8bc" : "#69bbd8"}
          />
        )),
      )}
      <Box p={[0, 1.25, 1]} s={[10, 0.2, 2]} c="#c3cdd2" />
      {[-4, 4].map((x) => (
        <Box key={x} p={[x, 0.6, 1]} s={[0.25, 1.2, 1.8]} c="#6c8391" />
      ))}
      {[-3, 0, 3].map((x) => (
        <group key={x}>
          <Screen p={[x, 1.95, 0.7]} s={[1.5, 0.9, 0.05]} />
          <Box p={[x, 1.45, 0.7]} s={[0.1, 0.5, 0.1]} c="#324e60" />
          <Box p={[x, 0.8, 3]} s={[1.1, 0.15, 1.1]} c="#263f50" />
          <Box p={[x, 1.4, 3.4]} s={[1.1, 1.1, 0.15]} c="#263f50" />
          <Cylinder p={[x, 0.4, 3]} radius={0.08} height={0.8} />
        </group>
      ))}
      <Label text="OPERATIONS / DIGITAL TWIN" p={[0, 4.65, -2.71]} width={4} />
    </group>
  );
}
export function IoT() {
  const trace = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (trace.current)
      trace.current.position.x = Math.sin(clock.elapsedTime) * 3;
  });
  return (
    <group>
      <Motor p={[-3.4, 0, 1]} />
      <Motor p={[0.2, 0, 1]} />
      {[-3.4, 0.2].map((x) => (
        <group key={x}>
          <Box p={[x, 1.45, 1]} s={[0.45, 0.35, 0.4]} c="#85d0b3" />
          <Pipe a={[x, 1.6, 1]} b={[x, 3.2, 1]} radius={0.018} c="#6ce1bd" />
          <Pipe
            a={[x, 3.2, 1]}
            b={[4.5, 3.2, -1.5]}
            radius={0.018}
            c="#6ce1bd"
          />
          <Box p={[x, 1.65, 1.22]} s={[0.1, 0.05, 0.04]} c="#a5ffe1" glow />
        </group>
      ))}
      <Box p={[4.5, 1.85, -1.5]} s={[1.4, 3.7, 1]} c="#a7bac5" />
      <Screen p={[4.5, 2.6, -0.97]} s={[1, 0.65, 0.05]} color="#7cdbb7" />
      <Label text="IIoT GATEWAY" p={[4.5, 1.85, -0.97]} width={1.1} />
      <Pipe
        a={[4.5, 3.7, -1.5]}
        b={[4.5, 4.2, -1.5]}
        radius={0.04}
        c="#293f4c"
      />
      <group ref={trace} position={[0, 3.2, 0.3]}>
        <Box s={[0.14, 0.14, 0.14]} c="#9deccf" glow />
      </group>
      <Screen p={[-0.5, 2.7, -2.8]} s={[4, 2, 0.05]} color="#7cdbb7" />
    </group>
  );
}
export function Vision() {
  return (
    <group>
      <Conveyor vision />
      <Box p={[-4, 0, -2.3]} s={[3, 0.03, 1.8]} c="#ba9c4c" />
      <Box p={[-4, 0.7, -2.3]} s={[0.7, 1.4, 0.7]} c="#b3bdc2" />
      <Label text="AI SAFETY / DETECTION" p={[0, 3.6, -3]} width={3} />
    </group>
  );
}
export const equipment = [
  Cooling,
  Electrical,
  Mechanical,
  Fabrication,
  Civil,
  () => <Mechanical red />,
  Servers,
  Manufacturing,
  ControlRoom,
  IoT,
  Vision,
];
