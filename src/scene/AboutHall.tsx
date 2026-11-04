import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  MathUtils,
  Object3D,
  SpotLight,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { Box, Cylinder } from "./Primitives";
import { Wayfinding, Planter } from "./Architecture";
import { StaticInstances } from "./StaticInstances";
import { aboutPoint, aboutStations, aboutStationAt } from "./aboutTour";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";
import { useTour } from "../store";
import type { Point } from "../data/chapters";

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
      {aboutStations.map((s) => (
        <HallDisplay key={s.number} station={s} />
      ))}
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
      <HallLight />
    </group>
  );
}
function HallDisplay({
  station: s,
}: {
  station: (typeof aboutStations)[number];
}) {
  const image = useTexture(assetUrl(s.image));
  const logo = useTexture(assetUrl("fast-logo.png"));
  const isCert = s.panel === "certifications",
    isPartner = s.panel === "partners";
  const dims = image.image as { width: number; height: number };
  const ratio = (dims?.width || 1) / (dims?.height || 1);
  const w = Math.min(isCert ? 2.2 : 3.5, (isCert ? 2.9 : 1.7) * ratio),
    h = w / ratio;
  const open = () => {
    if (s.partnerId) useTour.getState().setAboutPartner(s.partnerId);
    useTour.getState().setAboutPanel(s.panel);
  };
  return (
    <group
      position={[s.x, 0, s.z]}
      rotation={[0, s.rotation, 0]}
      name={`about-display-${s.number}`}
    >
      <StaticInstances>
        <Box p={[0, 2.7, -0.11]} s={[5.1, 5.4, 0.22]} c="#263f47" metal={0.2} />
        <Box
          p={[0, 2.7, 0.025]}
          s={[4.8, 5.1, 0.04]}
          c={isCert ? "#b9ad96" : "#d6d8ca"}
          metal={0.06}
        />
        {[-2.48, 2.48].map((x) => (
          <group key={x}>
            <Box
              p={[x, 2.7, 0.07]}
              s={[0.075, 5.2, 0.12]}
              c="#c9ad73"
              metal={0.65}
            />
            <Box
              p={[x * 0.95, 2.7, 0.11]}
              s={[0.025, 4.9, 0.02]}
              c="#c4e7e3"
              glow
            />
          </group>
        ))}
        <Box p={[0, 5.5, 0]} s={[5.4, 0.12, 0.75]} c="#536368" metal={0.5} />
        <Box p={[0, 5.42, 0.16]} s={[5.05, 0.025, 0.45]} c="#ffe6be" glow />
        {[-1.9, 1.9].map((x) => (
          <Cylinder
            key={x}
            p={[x, 5.95, 0]}
            radius={0.025}
            height={1.1}
            c="#929d99"
          />
        ))}
        <Wayfinding
          text={`${String(s.number).padStart(2, "0")} / ${s.title.toUpperCase()}`}
          sub={
            isCert
              ? "CERTIFICATIONS & LICENSES"
              : isPartner
                ? "INTERNATIONAL TECHNOLOGY PARTNER"
                : "APPROVALS & SUPPLIER REGISTRATIONS"
          }
          p={[0, 4.82, 0.12]}
          width={4.55}
          height={0.7}
        />
        <Wayfinding
          text={isPartner ? s.title : s.note}
          sub="FAST OPERATIONS & MAINTENANCE"
          p={[0, isCert ? 0.65 : 1.35, 0.14]}
          width={4.55}
          height={0.65}
        />
        <Box p={[0, 0.09, 0.2]} s={[5.35, 0.18, 1.5]} c="#53696a" />
        {isPartner && (
          <Box p={[0, 3.1, 0.12]} s={[4, 2.05, 0.06]} c="#f3f5ee" metal={0} />
        )}
      </StaticInstances>
      {s.number >= 30 && (
        <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.24]}>
          <Wayfinding
            text={s.title}
            sub="DISCOVER OUR GLOBAL TECHNOLOGY PARTNERS"
            p={[0, 4.45, 0.02]}
            width={4.5}
            height={0.85}
          />
          <Box p={[0, 2.9, 0.02]} s={[4, 2.05, 0.04]} c="#f3f5ee" metal={0} />
          <mesh position={[0, 2.9, 0.05]} onClick={open}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={image} toneMapped={false} />
          </mesh>
          <Wayfinding
            text="GLOBAL EXPERTISE. SAUDI DELIVERY."
            sub="FAST OPERATIONS & MAINTENANCE"
            p={[0, 1.2, 0.02]}
            width={4.5}
            height={0.65}
          />
        </group>
      )}
      <mesh
        position={[0, isCert ? 2.65 : isPartner ? 3.1 : 3.3, 0.18]}
        onClick={open}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={image} toneMapped={false} />
      </mesh>
      {isCert && (
        <mesh position={[1.65, 0.65, 0.17]}>
          <planeGeometry args={[0.85, 0.28]} />
          <meshBasicMaterial map={logo} toneMapped={false} />
        </mesh>
      )}
      <group position={[-1.8, 0.92, 1.1]} onClick={open}>
        <Box s={[0.12, 1.8, 0.12]} c="#a79164" metal={0.65} />
        <Box
          p={[0, 0.93, 0]}
          s={[1.2, 0.08, 0.7]}
          c="#20434e"
          r={[-0.25, 0, 0]}
        />
      </group>
    </group>
  );
}
function HallLight() {
  const light = useRef<SpotLight>(null),
    target = useMemo(() => new Object3D(), []);
  useFrame((_, dt) => {
    const s = aboutStationAt(journeyState.progress);
    if (!light.current) return;
    const p = s ? aboutPoint(s, 0, 2.6, 0.1) : [0, 78, 12];
    target.position.set(p[0], p[1] - 76, p[2]);
    target.updateMatrixWorld();
    const pos = s ? aboutPoint(s, 0, 5.7, 4) : [0, 81.7, 15];
    light.current.position.x = MathUtils.damp(
      light.current.position.x,
      pos[0],
      8,
      Math.min(dt, 0.1),
    );
    light.current.position.y = 5.7;
    light.current.position.z = MathUtils.damp(
      light.current.position.z,
      pos[2],
      8,
      Math.min(dt, 0.1),
    );
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        target={target}
        intensity={180}
        color="#ffe7c6"
        distance={17}
        angle={0.85}
        penumbra={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
      />
    </>
  );
}
