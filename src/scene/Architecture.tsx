import { ServiceFloors } from "./ServiceFloors";
import { stackLiftFloor, stackDoorOpen } from "./travelMotion";
import { liftDoorOpen } from "./travelMotion";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  Object3D,
  SRGBColorSpace,
  Vector3,
} from "three";
import { Box, Cylinder, Screen } from "./Primitives";
import { assetUrl } from "../lib/assets";
import { type Point } from "../data/chapters";
import { journeyState } from "./journey";
import { StaticInstances } from "./StaticInstances";
import { WorkplaceDetails } from "./PremiumInterior";
import { InteriorFloor } from "./InteriorFloor";

export type Part = { p: Point; s: Point; c?: string; r?: Point };
export function ArchitectureBatch({
  items,
  color = "#d7d2c7",
  glow = false,
  metal = 0.05,
}: {
  items: Part[];
  color?: string;
  glow?: boolean;
  metal?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new Object3D();
    const tint = new Color();
    items.forEach((item, i) => {
      object.position.set(...item.p);
      object.scale.set(...item.s);
      object.rotation.set(...(item.r || [0, 0, 0]));
      object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
      ref.current!.setColorAt(i, tint.set(item.c || color));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor)
      ref.current!.instanceColor.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items, color]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      castShadow={!glow}
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        color="white"
        roughness={glow ? 0.4 : 0.72}
        metalness={metal}
        emissive={glow ? color : "black"}
        emissiveIntensity={glow ? 2 : 0}
      />
    </instancedMesh>
  );
}

export function Wayfinding({
  text,
  sub = "FAST / OPERATIONS & MAINTENANCE",
  p,
  rotation = [0, 0, 0],
  width = 2.4,
  dark = true,
}: {
  text: string;
  sub?: string;
  p: Point;
  rotation?: Point;
  width?: number;
  dark?: boolean;
}) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = dark ? "#17313c" : "#ded9ca";
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = dark ? "#7ecbd6" : "#335b66";
    ctx.fillRect(40, 40, 5, 175);
    ctx.font = "500 20px sans-serif";
    ctx.fillText(sub, 75, 78);
    ctx.fillStyle = dark ? "#f0ede3" : "#183640";
    ctx.font = "500 52px sans-serif";
    ctx.fillText(text, 72, 160, 880);
    const texture = new CanvasTexture(c);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [text, sub, dark]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={p} rotation={rotation}>
      <planeGeometry args={[width, width / 4]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

export function ImportedFurniture({
  kind,
  p,
  rotation = 0,
}: {
  kind: "chair" | "sofa";
  p: Point;
  rotation?: number;
}) {
  const { scene } = useGLTF(assetUrl(`interior/lounge-${kind}.glb`));
  const model = useMemo(() => {
    const model = scene.clone(true);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = (kind === "chair" ? 0.95 : 2.6) / size.x;
    model.scale.setScalar(scale);
    model.position.set(
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale,
    );
    model.traverse((o) => {
      if ("isMesh" in o) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return model;
  }, [scene, kind]);
  return (
    <group position={p} rotation={[0, rotation, 0]}>
      <primitive object={model} />
    </group>
  );
}

export function Planter({ p, scale = 1 }: { p: Point; scale?: number }) {
  return (
    <group position={p} scale={scale}>
      <Cylinder
        radius={0.34}
        height={0.55}
        p={[0, 0.28, 0]}
        c="#b8aa8f"
        metal={0}
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i} rotation={[0, i * 2.4, 0]}>
          <Cylinder
            p={[0.12, 0.9, 0]}
            radius={0.025}
            height={1.1}
            c="#566b48"
            r={[0, 0, -0.18]}
            metal={0}
          />
          <mesh
            position={[0.26, 1.15 + (i % 3) * 0.18, 0]}
            rotation={[0.35, 0, -0.6]}
            scale={[0.22, 0.5, 0.055]}
            castShadow
          >
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color={i % 2 ? "#526e45" : "#6c8052"}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Desk({ p, rotation = 0 }: { p: Point; rotation?: number }) {
  return (
    <group position={p} rotation={[0, rotation, 0]}>
      <Box p={[0, 0.78, 0]} s={[2.5, 0.08, 1.15]} c="#b7a386" metal={0} />
      {[-1.05, 1.05].map((x) => (
        <Box key={x} p={[x, 0.38, 0]} s={[0.06, 0.76, 0.85]} c="#36454a" />
      ))}
      <Screen p={[0, 1.25, -0.28]} s={[0.85, 0.49, 0.035]} color="#b1d6ca" />
      <Box p={[0, 0.93, -0.29]} s={[0.04, 0.3, 0.04]} c="#263b42" />
      <Box p={[0, 0.85, 0.1]} s={[0.55, 0.025, 0.2]} c="#33454a" />
      <Box p={[0.8, 0.85, 0.15]} s={[0.28, 0.035, 0.38]} c="#e9e3d4" />
      <Cylinder
        p={[-0.8, 0.9, 0.1]}
        radius={0.07}
        height={0.14}
        c="#e4dfce"
        metal={0}
      />
      <Box p={[0, 0.45, 0.85]} s={[0.6, 0.1, 0.6]} c="#405655" />
      <Box p={[0, 0.83, 1.14]} s={[0.6, 0.75, 0.07]} c="#405655" />
      <Cylinder p={[0, 0.23, 0.85]} radius={0.035} height={0.45} c="#667277" />
      <Box p={[0, 0.06, 0.85]} s={[0.65, 0.07, 0.07]} c="#36454a" />
      <Box p={[0, 0.06, 0.85]} s={[0.07, 0.07, 0.65]} c="#36454a" />
    </group>
  );
}
function Glass({
  p,
  s,
  rotation = 0,
}: {
  p: Point;
  s: [number, number];
  rotation?: number;
}) {
  return (
    <mesh position={p} rotation={[0, rotation, 0]}>
      <planeGeometry args={s} />
      <meshStandardMaterial
        color="#b7d9d7"
        metalness={0.2}
        roughness={0.2}
        transparent
        opacity={0.1}
        depthWrite={false}
        side={2}
      />
    </mesh>
  );
}
function OfficeFloor() {
  const structure = useMemo(() => {
    const solid: Part[] = [
      { p: [0, 18.4, -10.4], s: [31.5, 4.8, 0.2], c: "#b8b8ad" },
      { p: [-15.6, 18.4, -1], s: [0.2, 4.8, 19], c: "#d4d2c7" },
      { p: [15.6, 18.4, -1], s: [0.2, 4.8, 19], c: "#d4d2c7" },
      { p: [-3.5, 20.8, -1], s: [24, 0.2, 19], c: "#e4e0d7" },
      { p: [14.5, 20.8, -1], s: [2, 0.2, 19], c: "#e4e0d7" },
      { p: [11, 20.8, 3], s: [5, 0.2, 11], c: "#e4e0d7" },
      { p: [11, 20.8, -9], s: [5, 0.2, 3], c: "#e4e0d7" },
    ];
    // Slabs leave an actual opening for the descending service lift.
    for (let x = -15; x <= 15; x++)
      for (let z = -10; z <= 8; z++) {
        const serviceShaft = Math.abs(x) < 2.5 && Math.abs(z + 7) < 2.5;
        if (!serviceShaft)
          solid.push({ p: [x, 15.85, z], s: [1, 0.3, 1], c: "#b5ada0" });
      }
    const trim: Part[] = [],
      lights: Part[] = [],
      wood: Part[] = [];
    for (const x of [-2.5, 2.5])
      for (const z of [-8, -4, 0, 3]) {
        trim.push({ p: [x, 18.35, z], s: [0.045, 4.7, 0.045] });
        trim.push({ p: [x, 16.2, z - 1.5], s: [0.06, 0.1, 3] });
        trim.push({ p: [x, 20.65, z - 1.5], s: [0.06, 0.1, 3] });
      }
    for (const x of [-10, -5, 0, 6, 11])
      lights.push({ p: [x, 20.64, -1], s: [0.08, 0.04, 15] });
    for (let x = -13; x < -4; x += 0.24)
      wood.push({ p: [x, 18.3, -9.9], s: [0.1, 4.6, 0.18] });
    for (let x = -15; x <= 15; x += 2.5)
      trim.push({ p: [x, 18.4, 8.4], s: [0.06, 4.8, 0.1] });
    return { solid, trim, lights, wood };
  }, []);
  return (
    <group name="furnished-office-floor">
      <InteriorFloor office />
      <WorkplaceDetails />
      <ArchitectureBatch items={structure.solid} />
      <ArchitectureBatch items={structure.trim} color="#747c76" metal={0.3} />
      <ArchitectureBatch items={structure.lights} color="#ffebcb" glow />
      <ArchitectureBatch items={structure.wood} color="#92775a" />
      <Glass p={[-2.5, 18.3, -3.5]} s={[12, 4.6]} rotation={Math.PI / 2} />
      <Glass p={[2.5, 18.3, -3.5]} s={[12, 4.6]} rotation={Math.PI / 2} />
      <Glass p={[0, 18.4, 8.4]} s={[31, 4.8]} />
      {[-12, -8, -4.5].flatMap((x) =>
        [-6, -1].map((z) => <Desk key={`${x}-${z}`} p={[x, 16, z]} />),
      )}
      <group position={[6.4, 16, -5]}>
        <Box p={[0, 0.8, 0]} s={[3, 0.12, 5]} c="#9a8164" metal={0} />
        <Box p={[0, 0.4, 0]} s={[0.45, 0.8, 3]} c="#394d51" />
        {[-1.2, 1.2].flatMap((z) =>
          [-2, 2].map((x) => (
            <ImportedFurniture
              key={`${x}-${z}`}
              kind="chair"
              p={[x, 0, z]}
              rotation={x > 0 ? -Math.PI / 2 : Math.PI / 2}
            />
          )),
        )}
        <Wayfinding
          text="THE BOARDROOM"
          sub="COLLABORATION / STRATEGY / DELIVERY"
          p={[0, 3, -5.25]}
          width={4}
          dark={false}
        />
      </group>
      <ImportedFurniture kind="sofa" p={[-8, 16, 6.7]} rotation={Math.PI} />
      <ImportedFurniture kind="chair" p={[-5.5, 16, 5.6]} rotation={-0.5} />
      <Box p={[-8, 16.35, 4.7]} s={[1.6, 0.12, 0.8]} c="#a38a68" />
      <Cylinder p={[-8, 16.16, 4.7]} radius={0.27} height={0.3} c="#5f6866" />
      <Wayfinding
        text="SPACES FOR POSSIBILITY"
        sub="FAST / WORKPLACE"
        p={[-8.5, 19, -9.76]}
        width={6}
      />
      <Wayfinding
        text="SYSTEMS GALLERY ↓"
        sub="LEVEL 01 / SERVICE LIFT"
        p={[0, 19.3, -10.25]}
        width={3.4}
      />
      {[
        [-13.5, 16, 6],
        [3.5, 16, 6],
        [13, 16, 6],
        [-14, 16, -8],
      ].map((p, i) => (
        <Planter key={i} p={p as Point} scale={1.2} />
      ))}
    </group>
  );
}

export function Lift({
  p,
  roof = false,
  exit = false,
  elevation = 0,
  stack = false,
}: {
  p: Point;
  roof?: boolean;
  exit?: boolean;
  elevation?: number;
  stack?: boolean;
}) {
  const panels = useRef<Group>(null),
    cabin = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (!panels.current) return;
    const progress = journeyState.progress;
    if (roof && p[1] === 83 && cabin.current)
      cabin.current.visible = progress < 1.36;
    const open = stack
      ? stackDoorOpen(progress)
      : liftDoorOpen(progress, exit ? "exit" : roof ? "roof" : "service");
    if (cabin.current && exit)
      cabin.current.position.y =
        progress < 11.53
          ? 12
          : Math.max(0.25, Math.min(12, camera.position.y - 1.7 - elevation));
    if (cabin.current && p[1] === 16) {
      if (roof) {
        cabin.current.visible = progress >= 1.36;
        cabin.current.position.y =
          progress < 1.48
            ? Math.max(16, Math.min(23, camera.position.y - 1.7 - elevation))
            : 16;
      } else {
        cabin.current.visible = progress < 1.96;
        cabin.current.position.y =
          progress > 1.82
            ? Math.max(6, Math.min(16, camera.position.y - 1.7 - elevation))
            : 16;
      }
    }
    if (stack && cabin.current) {
      cabin.current.position.y = stackLiftFloor(progress);
      cabin.current.visible = progress >= 1.96 && progress <= 11.4;
    }
    panels.current.children[0].position.x = -0.63 - open * 1.55;
    panels.current.children[1].position.x = 0.63 + open * 1.55;
  });
  return (
    <group ref={cabin} position={p} name={roof ? "roof-lift" : "service-lift"}>
      <Box p={[-1.58, 1.65, 1.75]} s={[0.7, 3.3, 0.16]} c="#717b79" />
      <Box p={[1.58, 1.65, 1.75]} s={[0.7, 3.3, 0.16]} c="#717b79" />
      <Box p={[0, 3.15, 1.75]} s={[3.7, 0.3, 0.16]} c="#717b79" />
      <Box p={[0, 1.65, -1.7]} s={[3.7, 3.3, 0.16]} c="#636f70" />
      <Box p={[-1.85, 1.65, 0]} s={[0.16, 3.3, 3.6]} c="#717b79" />
      <Box p={[1.85, 1.65, 0]} s={[0.16, 3.3, 3.6]} c="#717b79" />
      <Box p={[0, 3.35, 0]} s={[3.8, 0.16, 3.7]} c="#c5c9bd" />
      <Box p={[0, 0, 0]} s={[3.7, 0.12, 3.6]} c="#a0a99d" />
      <Box p={[0, 3.15, 0]} s={[2.5, 0.03, 0.06]} c="#e5e0c5" glow />
      <Wayfinding
        text={
          exit
            ? "WELCOME / RECEPTION"
            : roof
              ? "THE WORKPLACE"
              : "ENGINEERING FLOORS"
        }
        sub={
          exit
            ? "FAST / LEVEL 02 → GROUND FLOOR"
            : roof
              ? "FAST / ROOF → LEVEL 12"
              : stack
                ? "FAST / VERTICAL JOURNEY"
                : "FAST / LEVEL 12 → LEVEL 11"
        }
        p={[0, 2.2, -1.6]}
        width={2.8}
      />
      <Wayfinding
        text={exit ? "G" : stack ? "↓" : roof ? "12" : "11"}
        sub="DESTINATION"
        p={[1.75, 1.75, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={0.7}
      />
      <Box
        p={[0, 1.05, -1.58]}
        s={[3.25, 0.05, 0.06]}
        c="#b8b7a6"
        metal={0.7}
      />
      {[-1.73, 1.73].map((x) => (
        <group key={x}>
          <Box p={[x, 1.05, 0]} s={[0.06, 0.05, 2.9]} c="#b8b7a6" metal={0.7} />
          <Box p={[x, 1.65, -1.5]} s={[0.025, 3.1, 0.025]} c="#e6d4b4" glow />
          <Box p={[x, 0.15, 0]} s={[0.025, 0.03, 3.2]} c="#b9d0c4" glow />
        </group>
      ))}
      <group ref={panels} position={[0, 1.5, 1.75]}>
        <Box p={[-0.63, 0, 0]} s={[1.28, 3, 0.06]} c="#899897" metal={0.6} />
        <Box p={[0.63, 0, 0.01]} s={[1.28, 3, 0.06]} c="#899897" metal={0.6} />
      </group>
      <Wayfinding
        text={
          exit
            ? "RECEPTION / G"
            : roof
              ? "ROOF ACCESS / 83 M"
              : stack
                ? "ENGINEERING FLOORS"
                : "ELECTRICAL / 11"
        }
        p={[0, 3, 1.86]}
        width={3}
      />
    </group>
  );
}

export function RoofAccess() {
  return <Lift p={[11, 83, -5]} roof />;
}

export function Interior() {
  const office = useRef<Group>(null);
  useFrame(() => {
    if (office.current)
      office.current.visible =
        journeyState.progress > 1.27 && journeyState.progress < 2.06;
  });
  return (
    <group name="connected-building-interior">
      <group ref={office} position={[0, 60, 0]}>
        <StaticInstances>
          <OfficeFloor />
        </StaticInstances>
        <Lift p={[11, 16, -5]} roof elevation={60} />
        <Lift p={[0, 16, -7]} elevation={60} />
      </group>
      <ServiceFloors />
      <Lift p={[0, 66, -7]} stack />
    </group>
  );
}
