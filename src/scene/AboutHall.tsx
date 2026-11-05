import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group, RepeatWrapping, SRGBColorSpace } from "three";
import { Box, Cylinder } from "./Primitives";
import { Wayfinding, Planter } from "./Architecture";
import { StaticInstances } from "./StaticInstances";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";

function slabPieces(hole: [number, number, number, number]) {
  const [x0, x1, z0, z1] = hole;
  return [
    [-33, x0, -12, 68],
    [x1, 33, -12, 68],
    [x0, x1, -12, z0],
    [x0, x1, z1, 68],
  ].map(([a, b, c, d]) => ({
    x: (a + b) / 2,
    z: (c + d) / 2,
    w: b - a,
    h: d - c,
  }));
}
const floor = slabPieces([-2.3, 2.3, -9.4, -4.7]),
  roof = slabPieces([8.8, 13.2, -7.2, -2.8]);
export function AboutHall() {
  const tex = useTexture(assetUrl("electrical/materials/limestone-color.webp"));
  const maps = useMemo(
    () =>
      floor.map((s) => {
        const t = tex.clone();
        t.wrapS = t.wrapT = RepeatWrapping;
        t.colorSpace = SRGBColorSpace;
        t.repeat.set(s.w / 3, s.h / 3);
        t.offset.set((s.x - s.w / 2) / 3, -(s.z + s.h / 2) / 3);
        t.anisotropy = 4;
        t.needsUpdate = true;
        return t;
      }),
    [tex],
  );
  useEffect(() => () => maps.forEach((t) => t.dispose()), [maps]);
  return (
    <group position={[0, 16, 0]} name="about-fast-grand-hall">
      <StaticInstances>
        {floor.map((s, i) => (
          <group key={i}>
            <Box p={[s.x, -0.16, s.z]} s={[s.w, 0.32, s.h]} c="#b4b4aa" />
            <mesh
              position={[s.x, 0.008, s.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <planeGeometry args={[s.w, s.h]} />
              <meshStandardMaterial
                map={maps[i]}
                roughness={0.48}
                metalness={0.12}
              />
            </mesh>
          </group>
        ))}
        {roof.map((s, i) => (
          <Box key={i} p={[s.x, 6.65, s.z]} s={[s.w, 0.22, s.h]} c="#26373c" />
        ))}
        {[-33, 33].map((x) => (
          <Box
            key={x}
            p={[x, 3.25, 28]}
            s={[0.25, 6.5, 80]}
            c="#c4baa7"
            metal={0.05}
          />
        ))}
        {[-12, 68].map((z) => (
          <Box
            key={z}
            p={[0, 3.25, z]}
            s={[66, 6.5, 0.25]}
            c="#c4baa7"
            metal={0.05}
          />
        ))}
        {[-32.8, 32.8].map((x) => (
          <group key={x}>
            <Box p={[x, 0.25, 28]} s={[0.12, 0.5, 79.5]} c="#374b50" />
            <Box p={[x, 5.95, 28]} s={[0.08, 0.045, 79.5]} c="#efd3a5" glow />
            {Array.from({ length: 14 }, (_, i) => (
              <group key={i}>
                <Box
                  p={[x, 3, -10 + i * 6]}
                  s={[0.3, 5.5, 0.2]}
                  c="#8c7150"
                  metal={0.45}
                />
                <Box
                  p={[x - Math.sign(x) * 0.18, 3, -9.85 + i * 6]}
                  s={[0.03, 5.3, 0.04]}
                  c="#c5dece"
                  glow
                />
              </group>
            ))}
          </group>
        ))}
        {/* Coffered ceiling, timber ribs, mechanical grilles and suspended light rails. */}
        {[-22, 0, 22].flatMap((x) =>
          [8, 24, 40, 56].map((z) => (
            <group key={`${x}-${z}`}>
              <Box p={[x, 6.25, z]} s={[16, 0.18, 12]} c="#48534e" />
              {[-7.8, 7.8].map((dx) => (
                <Box
                  key={dx}
                  p={[x + dx, 6.08, z]}
                  s={[0.04, 0.035, 11.8]}
                  c="#ffe1af"
                  glow
                />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <Box
                  key={i}
                  p={[x - 7.2 + i * 0.75, 6.05, z]}
                  s={[0.08, 0.2, 11.3]}
                  c="#8b7051"
                  metal={0.05}
                />
              ))}
              <Box p={[x, 5.88, z + 3.5]} s={[3, 0.12, 0.8]} c="#293c43" />
              {Array.from({ length: 12 }, (_, i) => (
                <Box
                  key={i}
                  p={[x - 1.3 + i * 0.23, 5.8, z + 3.5]}
                  s={[0.06, 0.03, 0.7]}
                  c="#acb7b1"
                />
              ))}
            </group>
          )),
        )}
        <Wayfinding
          text="THE FAST GALLERY"
          sub="12 / ASSURANCE / INDUSTRY / GLOBAL TECHNOLOGY"
          p={[0, 4.9, 10]}
          rotation={[0, Math.PI, 0]}
          width={12}
          height={1.4}
        />
        {[-5.6, 5.6].map((x) => (
          <Cylinder
            key={x}
            p={[x, 5.9, 10]}
            radius={0.018}
            height={1.3}
            c="#879897"
          />
        ))}
        {[-20, 20].map((x) => (
          <Box key={x} p={[x, 0.035, 35]} s={[0.035, 0.012, 56]} c="#bca26c" />
        ))}
        {[-9, 9].flatMap((x) =>
          [33, 48].map((z) => (
            <group key={`${x}-${z}`}>
              <Box p={[x, 0.36, z]} s={[5, 0.5, 1.3]} c="#30464a" />
              <Box
                p={[x, 0.65, z]}
                s={[5.1, 0.15, 1.4]}
                c="#a48b68"
                metal={0.05}
              />
              <Box
                p={[x, 1.15, z - 0.57]}
                s={[5, 0.95, 0.12]}
                c="#7e6852"
                metal={0.05}
              />
            </group>
          )),
        )}
        <Cylinder p={[0, 0.2, 40]} radius={5.5} height={0.3} c="#253f49" />
        <Cylinder
          p={[0, 1.2, 40]}
          radius={1.1}
          height={1.8}
          c="#b69b6d"
          metal={0.6}
        />
        <Wayfinding
          text="GLOBAL EXPERTISE. SAUDI DELIVERY."
          sub="FAST / ENGINEERING / OPERATIONS / INTELLIGENCE"
          p={[0, 2, 41.3]}
          width={8}
          height={1.2}
        />
      </StaticInstances>
      <BinocularStation />
      <group position={[0, 3.6, 40]}>
        <mesh>
          <sphereGeometry args={[1.6, 24, 16]} />
          <meshStandardMaterial
            color="#6bcddd"
            wireframe
            transparent
            opacity={0.6}
            emissive="#2a8b9a"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.3, 0]}>
          <torusGeometry args={[2.1, 0.025, 8, 64]} />
          <meshStandardMaterial
            color="#d9bd86"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      {[-13, 13].flatMap((x) =>
        [27, 45, 59].map((z) => (
          <Planter key={`${x}-${z}`} p={[x, 0, z]} scale={1.3} />
        )),
      )}
      <pointLight
        position={[0, 4.6, 30]}
        color="#a7e6ee"
        intensity={70}
        distance={12}
      />
    </group>
  );
}
function BinocularStation() {
  const instrument = useRef<Group>(null);
  useFrame(() => {
    // The optical housing is behind our eyes in first-person view.
    if (instrument.current)
      instrument.current.visible =
        journeyState.progress < 1.602 || journeyState.progress >= 1.67;
  });
  return (
    <group
      position={[0, 0, 30]}
      name="fast-binocular-observatory"
      ref={instrument}
    >
      <StaticInstances>
        <Cylinder
          p={[0, 0.12, 0]}
          radius={0.7}
          height={0.24}
          c="#a48d61"
          metal={0.65}
        />
        <Cylinder
          p={[0, 0.75, 0]}
          radius={0.13}
          height={1.3}
          c="#d6dedc"
          metal={0.7}
        />
        <Box p={[0, 1.45, 0]} s={[1, 0.22, 0.55]} c="#193743" metal={0.55} />
        {[-0.25, 0.25].map((x) => (
          <group key={x}>
            <Cylinder
              p={[x, 1.65, 0]}
              radius={0.21}
              height={0.85}
              c="#d5d8ce"
              r={[Math.PI / 2, 0, 0]}
              metal={0.65}
            />
            <Cylinder
              p={[x, 1.65, 0.48]}
              radius={0.13}
              height={0.16}
              c="#183643"
              r={[Math.PI / 2, 0, 0]}
            />
            <Cylinder
              p={[x, 1.65, 0.57]}
              radius={0.09}
              height={0.025}
              c="#5ddae8"
              r={[Math.PI / 2, 0, 0]}
              metal={0.8}
            />
            <Cylinder
              p={[x, 1.65, -0.44]}
              radius={0.18}
              height={0.025}
              c="#527d90"
              r={[Math.PI / 2, 0, 0]}
            />
            <Cylinder
              p={[x * 2, 1.28, 0.14]}
              radius={0.045}
              height={0.35}
              c="#ae9464"
            />
          </group>
        ))}
        <Wayfinding
          text="A CLOSER LOOK AT FAST"
          sub="LOOK THROUGH / DISCOVER OUR WORLD"
          p={[0, 0.55, 0.3]}
          width={2.2}
          height={0.55}
        />
      </StaticInstances>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[2.6, 2.65, 64]} />
        <meshBasicMaterial color="#6acbd4" />
      </mesh>
      <Wayfinding
        text="THE FAST OBSERVATORY"
        sub="CREDENTIALS / INDUSTRY / GLOBAL PARTNERS"
        p={[0, 3.7, -3]}
        width={8}
        height={1.2}
      />
    </group>
  );
}
