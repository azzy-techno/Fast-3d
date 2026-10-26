import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Group, RepeatWrapping, SRGBColorSpace } from "three";
import { Box, Cylinder, Screen } from "./Primitives";
import {
  ArchitectureBatch,
  ImportedFurniture,
  Lift,
  Planter,
  Wayfinding,
  type Part,
} from "./Architecture";
import { StaticInstances } from "./StaticInstances";
import { journeyState } from "./journey";

function Pendant({
  p,
  radius = 1.4,
}: {
  p: [number, number, number];
  radius?: number;
}) {
  return (
    <group position={p}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.035, 8, 64]} />
        <meshStandardMaterial
          color="#d2b583"
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.016, 6, 64]} />
        <meshStandardMaterial
          color="#ffe5ae"
          emissive="#ffe1a1"
          emissiveIntensity={2}
        />
      </mesh>
      {[-1, 1].map((x) => (
        <Cylinder
          key={x}
          p={[x * radius, 0.4, 0]}
          radius={0.007}
          height={0.8}
          c="#a38f6b"
        />
      ))}
    </group>
  );
}
function Artwork({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      <Box s={[3.4, 2.2, 0.12]} c="#aa8a56" metal={0.65} />
      <Box p={[0, 0, 0.07]} s={[3.25, 2.05, 0.02]} c="#173c42" metal={0} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={i}
          position={[-1.25 + i * 0.4, Math.sin(i * 0.9) * 0.35, 0.1]}
          rotation={[0, 0, i * 0.3]}
        >
          <torusGeometry args={[0.55, 0.014, 6, 32, Math.PI * 1.3]} />
          <meshStandardMaterial
            color={i % 2 ? "#cdac72" : "#6f9e99"}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
export function WorkplaceDetails() {
  return (
    <group>
      <Pendant p={[6.4, 19.9, -5]} radius={1.8} />
      <Pendant p={[-8, 19.9, 5.2]} radius={1.35} />
      <Box p={[-8, 16.045, 5.4]} s={[5.8, 0.025, 4.7]} c="#526c69" metal={0} />
      <Box p={[6.4, 16.05, -5]} s={[7.6, 0.025, 7.3]} c="#6c726b" metal={0} />
      {[-1.2, 1.2].flatMap((z) =>
        [-0.9, 0.9].map((x) => (
          <group key={`${x}-${z}`} position={[6.4 + x, 16.88, -5 + z]}>
            <Box s={[0.4, 0.025, 0.29]} c="#d9c6a1" metal={0} />
            <Cylinder
              p={[0.1, 0.09, -0.35]}
              radius={0.045}
              height={0.18}
              c="#b6d4ce"
              metal={0.3}
            />
            <Box p={[-0.12, 0.04, 0]} s={[0.014, 0.012, 0.2]} c="#9d8052" />
          </group>
        )),
      )}
      <Artwork p={[-14.8, 18.5, -9.7]} />
      <Box p={[-8, 16.46, 4.7]} s={[0.65, 0.05, 0.4]} c="#eee5d3" metal={0} />
      <Box
        p={[-8.1, 16.51, 4.7]}
        s={[0.55, 0.05, 0.35]}
        c="#617e79"
        metal={0}
      />
      <Cylinder
        p={[-7.5, 16.65, 4.7]}
        radius={0.12}
        height={0.35}
        c="#bea678"
      />
      <Wayfinding
        text="DESIGNED TO CONNECT"
        sub="FAST / PEOPLE • PURPOSE • POSSIBILITY"
        p={[7, 18.8, 8.25]}
        rotation={[0, Math.PI, 0]}
        width={5}
      />
    </group>
  );
}
export function Reception() {
  const root = useRef<Group>(null),
    doors = useRef<Group>(null),
    lift = useRef<Group>(null);
  const marble = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#e1d9c7";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 34; i++) {
      ctx.beginPath();
      ctx.lineWidth = i % 4 === 0 ? 1.5 : 0.5;
      ctx.strokeStyle = i % 3 === 0 ? "#b4aa9670" : "#ffffff65";
      for (let x = 0; x <= 512; x += 4) {
        const y =
          i * 19 +
          Math.sin(x * 0.009 + i) * 35 +
          Math.sin(x * 0.037 + i * 2) * 6;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(3, 3);
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => marble.dispose(), [marble]);
  const slats = useMemo(
    () =>
      Array.from(
        { length: 65 },
        (_, i) =>
          ({ p: [-14 + i * 0.16, 2.75, -9.7], s: [0.07, 4.9, 0.2] }) as Part,
      ),
    [],
  );
  useFrame(() => {
    const p = journeyState.progress;
    if (root.current) root.current.visible = p > 11.48 && p < 11.9;
    if (lift.current) lift.current.visible = p > 11.43 && p < 11.73;
    const open = Math.min(1, Math.max(0, (p - 11.73) / 0.025));
    if (doors.current) {
      doors.current.children[0].position.x = -0.9 - open * 1.8;
      doors.current.children[1].position.x = 0.9 + open * 1.8;
    }
  });
  return (
    <>
      <group ref={lift}>
        <Lift p={[0, 12, -37]} exit />
      </group>
      <group ref={root} name="ground-floor-reception">
        <StaticInstances>
          <Box p={[0, 0.18, -23]} s={[4.6, 0.14, 30]} c="#c5bca7" metal={0.2} />
          <Box p={[0, 5.5, -22]} s={[4.6, 0.18, 26]} c="#d8d1c1" metal={0} />
          {[-2.3, 2.3].map((x) => (
            <group key={x}>
              <Box p={[x, 2.8, -23]} s={[0.1, 5.5, 28]} c="#8e8574" metal={0} />
              <Box
                p={[x * 0.9, 0.4, -23]}
                s={[0.02, 0.04, 28]}
                c="#eed7a7"
                glow
              />
              <Box
                p={[x * 0.9, 5.3, -23]}
                s={[0.03, 0.03, 28]}
                c="#eed7a7"
                glow
              />
            </group>
          ))}
          <Wayfinding
            text="RECEPTION →"
            sub="GROUND FLOOR / WELCOME"
            p={[0, 4.7, -10]}
            width={3}
          />
          <mesh position={[0, 0.18, -0.5]} receiveShadow>
            <boxGeometry args={[31, 0.14, 19]} />
            <meshStandardMaterial
              map={marble}
              roughness={0.26}
              metalness={0.18}
            />
          </mesh>
          <Box p={[0, 5.5, -0.5]} s={[31, 0.18, 19]} c="#d8d1c1" metal={0} />
          {[-8.9, 8.9].map((x) => (
            <Box
              key={x}
              p={[x, 2.8, -10]}
              s={[13.2, 5.5, 0.2]}
              c="#b8aa91"
              metal={0}
            />
          ))}
          {[-15.5, 15.5].map((x) => (
            <Box
              key={x}
              p={[x, 2.8, -0.5]}
              s={[0.2, 5.5, 19]}
              c="#d4caba"
              metal={0}
            />
          ))}
          <ArchitectureBatch items={slats} color="#76553c" />
          {[-12, -6, 6, 12].map((x) => (
            <Box
              key={x}
              p={[x, 5.37, -1]}
              s={[0.04, 0.025, 15]}
              c="#ffe0a2"
              glow
            />
          ))}
          <Box p={[-7, 2.8, -0.6]} s={[10, 5.1, 0.15]} c="#604b39" metal={0} />
          <ArchitectureBatch
            items={Array.from({ length: 50 }, (_, i) => ({
              p: [-11.8 + i * 0.2, 2.8, -0.49],
              s: [0.06, 5, 0.12],
            }))}
            color="#92704c"
          />
          <Wayfinding
            text="F A S T"
            sub="ENGINEERING • OPERATIONS • INTELLIGENCE"
            p={[-7, 3.2, -0.38]}
            width={5.5}
          />
          <Box p={[-7, 5.2, -0.35]} s={[9.5, 0.035, 0.06]} c="#e8c68a" glow />
          <group position={[-6, 0.25, 1.8]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[5, 1.1, 1.3]} />
              <meshStandardMaterial map={marble} roughness={0.24} />
            </mesh>
            <Box
              p={[0, 1.13, 0]}
              s={[5.2, 0.08, 1.45]}
              c="#263e3c"
              metal={0.45}
            />
            <Box p={[0, 0.08, 0.66]} s={[4.8, 0.035, 0.025]} c="#e7be74" glow />
            {Array.from({ length: 33 }, (_, i) => (
              <Box
                key={i}
                p={[-2.4 + i * 0.15, 0.6, 0.66]}
                s={[0.015, 0.85, 0.03]}
                c="#c4a476"
                metal={0.7}
              />
            ))}
            <Screen p={[-1, 1.47, -0.2]} s={[0.7, 0.4, 0.04]} color="#b0d9c8" />
            <Cylinder
              p={[1.6, 1.35, 0]}
              radius={0.16}
              height={0.35}
              c="#b19769"
            />
            <Wayfinding
              text="WELCOME"
              sub="FAST / RECEPTION"
              p={[0, 0.7, 0.69]}
              width={1.8}
            />
          </group>
          <Wayfinding
            text="F A S T"
            sub="OPERATIONS & MAINTENANCE"
            p={[-7, 3.5, -9.55]}
            width={6}
          />
          <Wayfinding
            text="G / RECEPTION"
            sub="YOUR NEXT CHAPTER STARTS HERE"
            p={[5, 3.4, -9.8]}
            width={4.5}
          />
          <Pendant p={[-6, 4.65, 2]} radius={2.3} />
          <Pendant p={[9, 4.6, 2]} radius={1.8} />
          <Box p={[9, 0.28, 2.5]} s={[8, 0.03, 8]} c="#597471" metal={0} />
          <ImportedFurniture kind="sofa" p={[9, 0.3, -0.3]} />
          <ImportedFurniture
            kind="chair"
            p={[6.7, 0.3, 3]}
            rotation={Math.PI / 2}
          />
          <ImportedFurniture
            kind="chair"
            p={[11.3, 0.3, 3]}
            rotation={-Math.PI / 2}
          />
          <Cylinder
            p={[9, 0.6, 2]}
            radius={1.1}
            height={0.12}
            c="#c6b798"
            metal={0.1}
          />
          <Cylinder p={[9, 0.42, 2]} radius={0.45} height={0.3} c="#917247" />
          <Box p={[9, 0.69, 2]} s={[0.6, 0.05, 0.4]} c="#355753" metal={0} />
          <Artwork p={[10, 2.9, -9.7]} />
          {[
            [-13, 0.25, 6],
            [13, 0.25, 6],
            [-13, 0.25, -7],
            [4, 0.25, -8],
          ].map((p, i) => (
            <Planter key={i} p={p as [number, number, number]} scale={1.4} />
          ))}
          {/* Glazed front leaves a real 3.6 m clear opening aligned with the exit. */}
          {[-7, 10.5].map((x, i) => (
            <mesh key={x} position={[x, 2.8, 9]}>
              <planeGeometry args={[i ? 11 : 16, 5.2]} />
              <meshStandardMaterial
                color="#a3c5c3"
                transparent
                opacity={0.12}
                depthWrite={false}
                side={2}
                roughness={0.12}
                metalness={0.25}
              />
            </mesh>
          ))}
          {[-15, -9, -3, 1.2, 4.8, 10, 15].map((x) => (
            <Box
              key={x}
              p={[x, 2.8, 9]}
              s={[0.06, 5.4, 0.08]}
              c="#9f8861"
              metal={0.7}
            />
          ))}
          <Box p={[3, 5.25, 9]} s={[3.8, 0.3, 0.18]} c="#354d4c" />
          <Wayfinding
            text="UNTIL NEXT TIME"
            sub="THANK YOU FOR EXPLORING FAST"
            p={[3, 4.9, 8.89]}
            rotation={[0, Math.PI, 0]}
            width={3.3}
          />
        </StaticInstances>
        <group ref={doors} position={[3, 2.6, 9]}>
          {[-0.9, 0.9].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.78, 4.7, 0.04]} />
                <meshStandardMaterial
                  color="#b5d6d4"
                  transparent
                  opacity={0.15}
                  depthWrite={false}
                  roughness={0.1}
                />
              </mesh>
              <Box
                p={[0, 0, 0.05]}
                s={[0.025, 1, 0.04]}
                c="#c5aa7b"
                metal={0.7}
              />
            </group>
          ))}
        </group>
      </group>
    </>
  );
}
