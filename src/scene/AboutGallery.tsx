import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Group,
  MeshBasicMaterial,
  SRGBColorSpace,
  MathUtils,
} from "three";
import { Box, Cylinder } from "./Primitives";
import { Wayfinding } from "./Architecture";
import { StaticInstances } from "./StaticInstances";
import { assetUrl } from "../lib/assets";
import { useTour } from "../store";
import { aboutTabs, certifications, partners } from "../data/about";
import { journeyState } from "./journey";

/** Executive gallery at level 12. All fittings stay outside the existing lift/guide lanes. */
export function AboutGallery() {
  const certs = useTexture(
    certifications.map((c) =>
      assetUrl(`about/certificates/iso-${c.code}.webp`),
    ),
  );
  return (
    <group position={[0, 16, 0]} name="about-fast-gallery">
      <StaticInstances>
        {/* Warm stone and bronze backdrop to the certificate collection. */}
        <Box
          p={[6.4, 2.35, -10.18]}
          s={[9.9, 4.7, 0.14]}
          c="#bfb09a"
          metal={0.08}
        />
        {Array.from({ length: 40 }, (_, i) => (
          <Box
            key={i}
            p={[2.3 + i * 0.21, 4.05, -10.05]}
            s={[0.07, 1.25, 0.13]}
            c="#6e523b"
            metal={0.05}
          />
        ))}
        <Wayfinding
          text="QUALITY. SAFETY. RESPONSIBILITY."
          sub="FAST / CERTIFIED MANAGEMENT SYSTEMS"
          p={[6.4, 4.08, -9.94]}
          width={8}
          height={0.7}
        />
        {certifications.map((c, i) => (
          <group key={c.code} position={[3.7 + i * 2.7, 2.35, -9.96]}>
            <Box s={[2.14, 2.96, 0.13]} c="#aa8753" metal={0.7} />
            <Box
              p={[0, 0, 0.08]}
              s={[2.02, 2.84, 0.03]}
              c="#f1ece0"
              metal={0.05}
            />
            <mesh position={[0, 0.02, 0.105]}>
              <planeGeometry args={[1.86, 2.63]} />
              <meshBasicMaterial map={certs[i]} toneMapped={false} />
            </mesh>
            <Wayfinding
              text={`ISO ${c.code}:${c.edition}`}
              sub="FAST OPERATIONS & MAINTENANCE"
              p={[0, -1.7, 0.11]}
              width={2.1}
              height={0.35}
            />
            <Box
              p={[0, 1.63, 0.2]}
              s={[2.3, 0.065, 0.38]}
              c="#ad8f62"
              metal={0.65}
            />
            <Box p={[0, 1.58, 0.25]} s={[2.15, 0.025, 0.28]} c="#ffe6b9" glow />
          </group>
        ))}
        {/* Broad coffer and timber ceiling bays leave both lift openings unobstructed. */}
        <Box p={[6, 4.65, 0.3]} s={[6, 0.12, 5.6]} c="#2b383a" />
        <Box p={[-9, 4.65, -1]} s={[10, 0.12, 14]} c="#34423f" />
        {[-13.8, -4.2].map((x) => (
          <Box
            key={x}
            p={[x, 4.55, -1]}
            s={[0.04, 0.035, 13.5]}
            c="#ffdf9d"
            glow
          />
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <Box
            key={i}
            p={[-13.6 + i * 0.27, 4.49, -1]}
            s={[0.055, 0.16, 13.2]}
            c="#85664a"
            metal={0.05}
          />
        ))}
        {[-2.4, 2.9].map((z) => (
          <Box
            key={z}
            p={[6, 4.53, z]}
            s={[5.8, 0.04, 0.035]}
            c="#ffdfb0"
            glow
          />
        ))}
        {/* Projection table and illuminated emitter; visitors pass along z=3.8. */}
        <Box
          p={[5.3, 0.05, -3.5]}
          s={[7.7, 0.045, 6.8]}
          c="#314c50"
          metal={0.18}
        />
        <Cylinder
          p={[5.3, 0.38, -3.7]}
          radius={1.5}
          height={0.72}
          c="#183a44"
          metal={0.6}
        />
        <Cylinder
          p={[5.3, 0.8, -3.7]}
          radius={2.15}
          height={0.14}
          c="#8c7758"
          metal={0.65}
        />
        <Cylinder
          p={[5.3, 0.9, -3.7]}
          radius={1.96}
          height={0.06}
          c="#183a46"
          metal={0.4}
        />
        <Cylinder
          p={[5.3, 0.95, -3.7]}
          radius={0.62}
          height={0.06}
          c="#99eff7"
          metal={0.25}
        />
        <Wayfinding
          text="FAST / KNOWLEDGE GALLERY"
          sub="ABOUT / CREDENTIALS / GLOBAL PARTNERS"
          p={[5.3, 0.5, -2.15]}
          width={2.6}
          height={0.35}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box
              p={[5.3 + side * 3.7, 0.08, -3.5]}
              s={[0.025, 0.015, 6.3]}
              c="#c9b181"
            />
            <Box
              p={[5.3, 0.08, -3.5 + side * 3.15]}
              s={[7.4, 0.015, 0.025]}
              c="#c9b181"
            />
          </group>
        ))}
        {/* Backlit stone brand wall at the lounge end of the route. */}
        <Box
          p={[-9, 2.35, -9.78]}
          s={[11.1, 4.5, 0.17]}
          c="#193a44"
          metal={0.12}
        />
        <Wayfinding
          text="ENGINEERING THE BACKBONE"
          sub="FAST OPERATIONS & MAINTENANCE / EST. 2017"
          p={[-9, 2.9, -9.65]}
          width={9.6}
          height={1.2}
        />
        <Wayfinding
          text="OF SAUDI INDUSTRY"
          sub="ENGINEERING / OPERATIONS / INTELLIGENCE"
          p={[-9, 1.65, -9.65]}
          width={9.6}
          height={1.1}
        />
        {[-14.4, -3.6].map((x) => (
          <Box
            key={x}
            p={[x, 2.35, -9.6]}
            s={[0.035, 4.15, 0.04]}
            c="#e2cd9a"
            glow
          />
        ))}
        <Wayfinding
          text="13 GLOBAL TECHNOLOGY PARTNERS"
          sub="INTERNATIONAL EXPERTISE / LOCAL DELIVERY"
          p={[-9, 3.4, 8.15]}
          rotation={[0, Math.PI, 0]}
          width={9}
          height={1}
        />
      </StaticInstances>
      <mesh position={[5.3, 4.25, -3.7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.035, 8, 72]} />
        <meshStandardMaterial
          color="#d8b979"
          metalness={0.65}
          roughness={0.3}
          emissive="#c9a66b"
          emissiveIntensity={0.45}
        />
      </mesh>
      <Projector />
    </group>
  );
}

function Projector() {
  const panel = useTour((s) => s.aboutPanel);
  const screen = useRef<Group>(null),
    rings = useRef<Group>(null),
    scan = useRef<Group>(null);
  const beam = useRef<MeshBasicMaterial>(null);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)"),
    [],
  );
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1536;
    c.height = 640;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#082634e8";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#75e9f1";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 1528, 632);
    ctx.fillStyle = "#a2eff5";
    ctx.font = "20px sans-serif";
    ctx.fillText("FAST / LEVEL 12 / KNOWLEDGE GALLERY", 50, 54);
    ctx.font = "48px sans-serif";
    ctx.fillStyle = "#e3feff";
    ctx.fillText(
      panel === "partners"
        ? "GLOBAL EXPERTISE. SAUDI DELIVERY."
        : panel === "certifications"
          ? "QUALITY. SAFETY. RESPONSIBILITY."
          : panel === "approvals"
            ? "CONNECTED TO SAUDI INDUSTRY."
            : "ENGINEERING THE BACKBONE",
      50,
      133,
    );
    ctx.fillStyle = "#9cd2dc";
    ctx.font = "22px sans-serif";
    ctx.fillText(
      panel === "partners"
        ? "13 INTERNATIONAL TECHNOLOGY PARTNERS"
        : panel === "certifications"
          ? "ISO 9001 / ISO 14001 / ISO 45001"
          : panel === "approvals"
            ? "APPROVALS & SUPPLIER REGISTRATIONS"
            : "OF SAUDI INDUSTRY / ESTABLISHED 2017",
      50,
      179,
    );
    const items =
      panel === "partners"
        ? partners.map((p) => p.name)
        : panel === "certifications"
          ? [
              "ISO 9001:2015",
              "Quality management",
              "ISO 14001:2015",
              "Environmental management",
              "ISO 45001:2018",
              "Health & safety",
            ]
          : panel === "approvals"
            ? [
                "Saudi Aramco",
                "Saudi Energy (SEC)",
                "Ma’aden",
                "Hadeed",
                "Petro Rabigh",
                "Siemens Energy",
                "SAP Ariba Network",
              ]
            : [
                "Integrated engineering",
                "Operations & maintenance",
                "Industrial automation",
                "3D & digital twins",
                "Technology partnerships",
                "Saudi Vision 2030",
              ];
    items.forEach((name, i) => {
      const x = 50 + (i % 3) * 485,
        y = 260 + Math.floor(i / 3) * 65;
      ctx.fillStyle = "#76b7c3";
      ctx.font = "16px sans-serif";
      ctx.fillText(String(i + 1).padStart(2, "0"), x, y);
      ctx.fillStyle = "#cefbff";
      ctx.font = "24px sans-serif";
      ctx.fillText(name, x + 40, y, 420);
    });
    ctx.fillStyle = "#8bdae7";
    ctx.font = "16px sans-serif";
    ctx.fillText("SELECT A PROJECTION TO EXPLORE", 50, 607);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [panel]);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(({ gl }, dt) => {
    const active = journeyState.progress > 1.49 && journeyState.progress < 1.76;
    if (!active) return;
    const d = Math.min(dt, 0.05);
    if (screen.current) {
      screen.current.scale.y = MathUtils.damp(
        screen.current.scale.y,
        panel ? 1 : 0.9,
        7,
        d,
      );
    }
    if (rings.current && !reduced.matches) rings.current.rotation.y += d * 0.13;
    if (scan.current && !reduced.matches)
      scan.current.position.y =
        1.625 + ((performance.now() * 0.00017) % 1) * 2.25;
    if (beam.current)
      beam.current.opacity = MathUtils.damp(
        beam.current.opacity,
        panel ? 0.09 : 0.035,
        5,
        d,
      );
    gl.domElement.dataset.aboutProjection = panel || "idle";
  });
  return (
    <group name="fast-holographic-projector" userData={{ dynamic: true }}>
      <group ref={screen} position={[5.3, 2.75, -4.2]}>
        <mesh onClick={() => useTour.getState().setAboutPanel("partners")}>
          <planeGeometry args={[5.4, 2.25]} />
          <meshBasicMaterial
            map={map}
            transparent
            opacity={0.87}
            side={DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <Box p={[0, -1.14, 0]} s={[5.45, 0.025, 0.02]} c="#9eeaf5" glow />
        {aboutTabs.map((t, i) => (
          <group
            key={t.id}
            position={[-2.025 + i * 1.35, -1.52, 0]}
            onClick={(e) => {
              e.stopPropagation();
              useTour.getState().setAboutPanel(t.id);
            }}
          >
            <Wayfinding
              text={t.en.toUpperCase()}
              sub={t.number + " / EXPLORE"}
              p={[0, 0, 0]}
              width={1.28}
              height={0.44}
            />
          </group>
        ))}
      </group>
      <mesh position={[5.3, 2.25, -3.7]}>
        <cylinderGeometry args={[2.6, 0.46, 2.6, 40, 1, true]} />
        <meshBasicMaterial
          ref={beam}
          color="#71eaff"
          transparent
          opacity={0.035}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <group ref={rings} position={[5.3, 1, -3.7]}>
        {[0.7, 1.1, 1.6].map((r, i) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, i]}>
            <torusGeometry args={[r, 0.009, 4, 64, Math.PI * 1.7]} />
            <meshBasicMaterial
              color="#8feeff"
              toneMapped={false}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <group ref={scan} position={[5.3, 1.625, -4.18]}>
        <mesh>
          <planeGeometry args={[5.35, 0.012]} />
          <meshBasicMaterial
            color="#a1ffff"
            transparent
            opacity={0.35}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
