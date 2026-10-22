import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  AnimationMixer,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  ExtrudeGeometry,
  Shape,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { Box, Cylinder } from "./Primitives";
import { assetUrl } from "../lib/assets";
import { useTour } from "../store";
import type { Point } from "../data/chapters";
import {
  ExteriorSurfaces,
  groundSurface,
  type Surface,
} from "./ExteriorSurfaces";

const random = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const exteriorVisible = () => {
  const p = useTour.getState().progress;
  return p < 0.85 || p > 11.65;
};

/** Deterministic, locally generated surface grain, with no remote texture requests. */
export function useSurface(kind: "stone" | "road" | "water") {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const data = ctx.createImageData(512, 512);
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const i = (y * 512 + x) * 4;
        const noise = random(x + y * 512);
        const seam =
          kind === "stone" &&
          (y % 128 < 2 || (x + (Math.floor(y / 128) % 2) * 128) % 256 < 2);
        const value =
          kind === "road"
            ? 55 + noise * 28
            : kind === "water"
              ? 135 +
                Math.sin(x * 0.13 + Math.sin(y * 0.08) * 3) * 28 +
                noise * 15
              : seam
                ? 135
                : 200 + noise * 28;
        data.data[i] = data.data[i + 1] = data.data[i + 2] = value;
        data.data[i + 3] = 255;
      }
    ctx.putImageData(data, 0, 0);
    const t = new CanvasTexture(canvas);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(kind === "road" ? 24 : 8, kind === "road" ? 3 : 8);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

type Instance = { p: Point; s: Point; color?: string; r?: Point };
function shrubGeometry() {
  const vertices: number[] = [];
  for (let i = 0; i < 70; i++) {
    const a = random(i) * Math.PI * 2,
      r = Math.sqrt(random(i + 71)) * 0.85;
    const x = Math.cos(a) * r,
      y = random(i + 142) * 1.2 - 0.4,
      z = Math.sin(a) * r;
    const dx = Math.cos(a + 0.8) * 0.27,
      dz = Math.sin(a + 0.8) * 0.27;
    vertices.push(
      x - dx,
      y,
      z - dz,
      x,
      y + 0.09,
      z + 0.1,
      x + dx,
      y + 0.16,
      z + dz,
    );
    vertices.push(
      x - dx,
      y,
      z - dz,
      x + dx,
      y + 0.16,
      z + dz,
      x,
      y - 0.02,
      z - 0.1,
    );
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  g.computeVertexNormals();
  return g;
}
function Repeated({
  items,
  color = "#ddd5c5",
  metal = 0.15,
  roughness = 0.65,
  emissive = false,
  shape = "box",
}: {
  shape?: "box" | "cylinder" | "sphere" | "shrub";
  items: Instance[];
  color?: string;
  metal?: number;
  roughness?: number;
  emissive?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const shrub = useMemo(
    () => (shape === "shrub" ? shrubGeometry() : null),
    [shape],
  );
  useEffect(() => () => shrub?.dispose(), [shrub]);
  useLayoutEffect(() => {
    const o = new Object3D();
    items.forEach((item, i) => {
      o.position.set(...item.p);
      o.scale.set(...item.s);
      o.rotation.set(...(item.r || [0, 0, 0]));
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, new Color(item.color || color));
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
      castShadow
      receiveShadow
      name="city-instanced-detail"
    >
      {shrub ? (
        <primitive object={shrub} attach="geometry" />
      ) : shape === "cylinder" ? (
        <cylinderGeometry args={[1, 1, 1, 12]} />
      ) : shape === "sphere" ? (
        <sphereGeometry args={[1, 10, 8]} />
      ) : (
        <boxGeometry />
      )}
      <meshStandardMaterial
        color="white"
        side={shrub ? DoubleSide : undefined}
        metalness={metal}
        roughness={roughness}
        emissive={emissive ? "#ffce91" : "black"}
        emissiveIntensity={emissive ? 0.45 : 0}
      />
    </instancedMesh>
  );
}

function City() {
  const { masses, facades, bands, rooftops } = useMemo(() => {
    const masses: Instance[] = [],
      facades: Record<string, Surface[]> = {},
      bands: Instance[] = [],
      rooftops: Instance[] = [];
    const sites = [
      [-56, -24, 13, 18, 22],
      [-51, -61, 22, 17, 32],
      [-12, -60, 19, 16, 45],
      [0, -81, 17, 18, 38],
      [40, -86, 16, 17, 54],
      [56, -59, 24, 21, 30],
      [62, -25, 21, 18, 37],
      [105, -25, 17, 18, 58],
      [-85, -65, 17, 23, 49],
      [-80, -22, 20, 15, 14],
      [92, -90, 19, 19, 65],
      [-107, -115, 25, 22, 55],
      [-62, -120, 24, 24, 70],
      [-10, -130, 20, 20, 63],
      [48, -133, 21, 21, 76],
      [70, -130, 20, 20, 51],
      // Fill the left-hand district in staggered rows, with clear street corridors.
      [-42, 23, 19, 18, 21],
      [-69, 23, 20, 18, 29],
      [-99, 23, 23, 18, 24],
      [-127, 23, 20, 18, 36],
      [-156, 23, 24, 18, 27],
      [-108, -23, 20, 17, 33],
      [-137, -23, 24, 17, 42],
      [-166, -23, 22, 17, 30],
      [-114, -65, 22, 23, 47],
      [-145, -65, 23, 23, 37],
      [-177, -65, 22, 23, 56],
      [-141, -115, 21, 22, 64],
      [-175, -115, 23, 22, 43],
      [-108, -166, 22, 23, 62],
      [-65, -166, 24, 24, 57],
      [-10, -181, 20, 22, 70],
      [65, -181, 22, 22, 63],
      [-151, -173, 23, 24, 58],
      [-198, -165, 24, 24, 74],
    ];
    sites.forEach(([x, z, w, d, h], n) => {
      x *= 1.22;
      z -= 24;
      h *= 0.82;
      masses.push({
        p: [x, h / 2 - 0.3, z],
        s: [w, h, d],
        color: ["#baaf96", "#708c94", "#9ca9a8", "#d0bda0"][n % 4],
      });
      masses.push({
        p: [x, 0.15, z],
        s: [w + 5, 0.8, d + 5],
        color: "#c1bbaa",
      });
      const style =
        h < 13
          ? "facade-villa"
          : [
              "facade-office-stone",
              "facade-tower-glass",
              "facade-apartment-white",
              "facade-apartment-sand",
            ][n % 4];
      const retail = n >= 16 && n <= 20;
      const base = retail ? 3.6 : 0.6;
      const height = h - base;
      const tileWidth = style === "facade-villa" ? 12 : 16;
      const tileHeight = style === "facade-villa" ? 7 : 13.2;
      const walls: Surface[] = [
        { p: [x, base + height / 2, z + d / 2 + 0.02], size: [w, height] },
        {
          p: [x, base + height / 2, z - d / 2 - 0.02],
          size: [w, height],
          rotation: [0, Math.PI, 0],
        },
        {
          p: [x + w / 2 + 0.02, base + height / 2, z],
          size: [d, height],
          rotation: [0, Math.PI / 2, 0],
        },
        {
          p: [x - w / 2 - 0.02, base + height / 2, z],
          size: [d, height],
          rotation: [0, -Math.PI / 2, 0],
        },
      ];
      (facades[style] ??= []).push(
        ...walls.map((wall) => ({
          ...wall,
          repeat: [wall.size[0] / tileWidth, height / tileHeight] as [
            number,
            number,
          ],
        })),
      );
      if (retail)
        (facades["facade-retail-ground"] ??= []).push({
          p: [x, 2.05, z + d / 2 + 0.025],
          size: [w, 3.1],
          repeat: [w / 18, 0.56],
          offset: [0, 0.22],
        });
      (facades["roof-flat"] ??= []).push({
        ...groundSurface([x, h + 0.41, z], [w, d]),
        repeat: [1, 1],
      });
      bands.push({ p: [x, h + 0.1, z], s: [w + 0.6, 0.6, d + 0.6] });
      rooftops.push({
        p: [x, h + 0.7, z],
        s: [w * 0.45, 1.3, d * 0.4],
        color: "#87918d",
      });
      rooftops.push({
        p: [x - w * 0.3, h + 1.3, z - d * 0.2],
        s: [1.5, 2.5, 2.5],
        color: "#8d9a99",
      });
    });
    return { masses, facades, bands, rooftops };
  }, []);
  return (
    <group name="surrounding-city">
      <Repeated items={masses} />
      {Object.entries(facades).map(([texture, surfaces]) => (
        <ExteriorSurfaces
          key={texture}
          texture={texture}
          surfaces={surfaces}
          glass={texture === "facade-tower-glass"}
        />
      ))}
      <Repeated items={bands} />
      <Repeated items={rooftops} />
    </group>
  );
}

/** Individual tapered leaflets rather than low-poly foliage blobs. Shared by every palm. */
function palmGeometry() {
  const vertices: number[] = [],
    colors: number[] = [];
  const tri = (a: number[], b: number[], c: number[], shade: number) => {
    vertices.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++)
      colors.push(0.19 * shade, 0.29 * shade, 0.11 * shade);
  };
  for (let f = 0; f < 13; f++) {
    const angle = (f * Math.PI * 2) / 13,
      length = 2.8 + random(f) * 1.2;
    const point = (u: number, v: number) => {
      const r = u * length,
        y = Math.sin(u * Math.PI) * 0.8 - u * u * 0.7;
      return [
        Math.cos(angle) * r - Math.sin(angle) * v,
        y,
        Math.sin(angle) * r + Math.cos(angle) * v,
      ];
    };
    for (let j = 1; j < 23; j++) {
      const u = j / 24,
        width = Math.sin(u * Math.PI) * 0.58;
      for (const side of [-1, 1])
        tri(
          point(u - 0.025, 0),
          point(u + 0.14, width * side),
          point(u + 0.025, 0),
          0.8 + random(f * 24 + j) * 0.55,
        );
      tri(
        point(u - 0.03, -0.018),
        point(u + 0.025, 0.018),
        point(u + 0.04, -0.018),
        1.3,
      );
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
function Landscaping({ mobile }: { mobile: boolean }) {
  const foliage = useMemo(palmGeometry, []);
  useEffect(() => () => foliage.dispose(), [foliage]);
  const crowns = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (crowns.current && exteriorVisible())
      crowns.current.rotation.z = Math.sin(clock.elapsedTime * 0.65) * 0.008;
  });
  const palms = useMemo(
    () => [
      [-23, 20, 6.7],
      [-18, 20, 7.5],
      [15, 20, 6.5],
      [23, 20, 8],
      [23, 6, 7.1],
      [23, -10, 7.8],
      [23, -28, 7],
      [-23, 5, 6.8],
      [-23, -10, 7.5],
      [-23, -28, 7],
      [-45, 34, 7.5],
      [-27, 34, 7.8],
      [-9, 34, 7],
      [9, 34, 8],
      [27, 34, 7.3],
      [45, 34, 7.7],
      [48, -8, 7],
      [48, -30, 7],
      [-42, -20, 7],
      [-42, -43, 7],
    ],
    [],
  );
  const shrubs = useMemo(
    () =>
      Array.from({ length: mobile ? 90 : 180 }, (_, i) => {
        const lane = i % 3;
        return {
          p: [
            lane === 0
              ? -23 + random(i) * 2
              : lane === 1
                ? 20 + random(i) * 3
                : -23 + random(i) * 48,
            0.35 + random(i + 5) * 0.35,
            lane < 2 ? -34 + random(i + 20) * 49 : 35 + random(i + 20) * 1.4,
          ] as Point,
          s: [
            0.28 + random(i + 10) * 0.35,
            0.35 + random(i + 11) * 0.55,
            0.3 + random(i + 3) * 0.3,
          ] as Point,
          color: ["#56633d", "#78805b", "#4a5c3c", "#8a8b60"][i % 4],
          r: [0, random(i) * Math.PI, random(i + 4) * 0.2] as Point,
        };
      }),
    [mobile],
  );
  return (
    <group name="landscaped-boulevard">
      <Repeated
        shape="cylinder"
        items={useMemo(
          () =>
            palms.flatMap(([x, z, h]) => [
              {
                p: [x, h / 2, z] as Point,
                s: [0.18, h, 0.18] as Point,
                color: "#78664f",
              },
              ...Array.from({ length: 12 }, (_, k) => ({
                p: [x, h * 0.12 + k * h * 0.065, z] as Point,
                s: [0.22 - k * 0.004, 0.07, 0.22 - k * 0.004] as Point,
                color: "#94836b",
              })),
            ]),
          [palms],
        )}
        metal={0}
        roughness={0.95}
      />
      <group ref={crowns}>
        {palms.map(([x, z, h], i) => (
          <mesh
            key={i}
            position={[x, h, z]}
            geometry={foliage}
            rotation={[0, i * 1.6, 0]}
            castShadow
          >
            <meshStandardMaterial
              vertexColors
              side={DoubleSide}
              roughness={0.82}
            />
          </mesh>
        ))}
      </group>
      <Repeated items={shrubs} shape="shrub" metal={0} roughness={1} />
      {[-18, -4, 10].map((x) => (
        <group key={x} position={[x, 0.1, 36]}>
          <Box p={[0, 0.42, 0]} s={[3, 0.18, 0.7]} c="#8f7657" metal={0} />
          <Box p={[0, 0.9, -0.3]} s={[3, 0.75, 0.09]} c="#8f7657" metal={0} />
          {[-1.1, 1.1].map((dx) => (
            <Box key={dx} p={[dx, 0.2, 0]} s={[0.12, 0.5, 0.65]} c="#394144" />
          ))}
        </group>
      ))}
      {[-36, -12, 12, 36, 60].map((x) => (
        <group key={x} position={[x, 0, 32.5]}>
          <Cylinder p={[0, 3.6, 0]} radius={0.075} height={7.2} c="#51575a" />
          <Box p={[0, 7.2, -0.8]} s={[0.18, 0.15, 1.9]} c="#61686a" />
          <Box p={[0, 7.1, -1.2]} s={[0.14, 0.04, 0.7]} c="#ffdda6" glow />
        </group>
      ))}
    </group>
  );
}

function Pedestrian({ index }: { index: number }) {
  const { scene, animations } = useGLTF(assetUrl("exterior/pedestrian.glb"));
  const { model, mixer, scale } = useMemo(() => {
    const model = clone(scene);
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const mixer = new AnimationMixer(model);
    // The source rig already converts centimetres to metres on its Character node.
    return { model, mixer, scale: 1 };
  }, [scene, animations, index]);
  useEffect(() => {
    const walk = animations.find((a) => a.name === "Walk");
    if (walk) {
      const action = mixer.clipAction(walk);
      action.reset().play();
      action.time = index * 0.63;
    }
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    };
  }, [mixer, model, animations, index]);
  const root = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!root.current || !exteriorVisible()) return;
    mixer.update(Math.min(dt, 0.05));
    const t = mixer.time * 0.72 + index * 23.9;
    const lane = index % 2,
      direction = lane ? -1 : 1;
    root.current.position.set(
      ((t % 160) - 80) * direction,
      0.12,
      lane ? 34 : 21.8,
    );
    // The imported Walk rig faces local -Z, not +Z. Match its facing to travel.
    root.current.rotation.y = (-direction * Math.PI) / 2;
  });
  return (
    <group ref={root} name="walking-pedestrian">
      <primitive object={model} scale={scale} />
    </group>
  );
}
function Birds() {
  const root = useRef<Group>(null);
  const wings = useRef<(Group | null)[]>([]);
  const wing = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute(
      "position",
      new Float32BufferAttribute(
        [
          0, 0, 0, 0.52, 0.03, -0.12, 1.1, -0.07, -0.38, 0, 0, 0, 1.1, -0.07,
          -0.38, 0.45, 0, -0.3,
        ],
        3,
      ),
    );
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => wing.dispose(), [wing]);
  useFrame(({ clock }) => {
    if (!root.current || !exteriorVisible()) return;
    const t = clock.elapsedTime * 0.07;
    root.current.position.set(
      Math.cos(t) * 29,
      29 + Math.sin(t * 2) * 3,
      -12 + Math.sin(t) * 24,
    );
    root.current.rotation.y = -t;
    wings.current.forEach((w, i) => {
      if (w)
        w.rotation.z =
          Math.sin(clock.elapsedTime * 4.2 + Math.floor(i / 2) * 1.3) *
          0.42 *
          (i % 2 ? -1 : 1);
    });
  });
  return (
    <group ref={root} name="flying-birds">
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          position={[i * 1.7, Math.sin(i) * 1.3, i * 0.9]}
          scale={0.65}
        >
          <mesh scale={[0.12, 0.1, 0.42]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#c6cbc5" roughness={0.9} />
          </mesh>
          {[-1, 1].map((side, j) => (
            <group
              key={side}
              ref={(el) => {
                wings.current[i * 2 + j] = el;
              }}
            >
              <mesh geometry={wing} scale={[side, 1, 1]}>
                <meshStandardMaterial
                  color="#b7bbb4"
                  side={DoubleSide}
                  roughness={0.9}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function vehicleGeometry(glass: boolean) {
  const shape = new Shape();
  if (glass) {
    shape.moveTo(-1.3, 0.91);
    shape.lineTo(-0.72, 1.5);
    shape.quadraticCurveTo(0.1, 1.62, 0.72, 1.45);
    shape.lineTo(1.32, 0.91);
    shape.closePath();
  } else {
    shape.moveTo(-2.05, 0.4);
    shape.lineTo(-2.13, 0.67);
    shape.quadraticCurveTo(-2.12, 0.93, -1.35, 0.98);
    shape.lineTo(1.3, 0.98);
    shape.quadraticCurveTo(2.1, 0.87, 2.14, 0.64);
    shape.lineTo(2.08, 0.4);
    shape.closePath();
  }
  const depth = glass ? 1.45 : 1.65;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: glass ? 0.035 : 0.09,
    bevelThickness: 0.06,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateY(Math.PI / 2);
  return geometry;
}
function Car({ index, parked = false }: { index: number; parked?: boolean }) {
  const root = useRef<Group>(null);
  const body = useMemo(() => vehicleGeometry(false), []),
    glass = useMemo(() => vehicleGeometry(true), []);
  useEffect(
    () => () => {
      body.dispose();
      glass.dispose();
    },
    [body, glass],
  );
  useFrame(({ clock }) => {
    if (root.current && !parked && exteriorVisible()) {
      const reverse = index % 2 === 0;
      root.current.position.x =
        ((clock.elapsedTime * (reverse ? 3 : -3) + index * 37 + 500) % 150) -
        75;
      root.current.position.z = reverse ? 25 : 29;
      root.current.rotation.y = reverse ? Math.PI / 2 : -Math.PI / 2;
    }
  });
  return (
    <group
      ref={root}
      position={parked ? [21, 0.05, -25 + index * 5] : [index * 20, 0, 27]}
      rotation={[0, parked ? Math.PI / 2 : 0, 0]}
      name={parked ? "parked-car" : "moving-car"}
    >
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial
          color={["#d3d5d0", "#28383f", "#a8a8a1", "#565e60"][index % 4]}
          metalness={0.65}
          roughness={0.22}
          clearcoat={1}
        />
      </mesh>
      <mesh geometry={glass} castShadow>
        <meshPhysicalMaterial
          color="#354b54"
          metalness={0.9}
          roughness={0.14}
          clearcoat={1}
        />
      </mesh>
      <Box
        p={[0, 1.53, 0]}
        s={[1.47, 0.07, 1.3]}
        c={index % 2 ? "#435054" : "#c1c5bf"}
        metal={0.7}
      />
      {[-0.88, 0.88].flatMap((x) =>
        [-1.35, 1.35].map((z) => (
          <group
            key={`${x}${z}`}
            position={[x, 0.42, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <Cylinder radius={0.39} height={0.24} c="#202325" metal={0} />
            <Cylinder radius={0.23} height={0.26} c="#8b989e" />
          </group>
        )),
      )}
      {[-0.6, 0.6].map((x) => (
        <group key={x}>
          <Box p={[x, 0.76, 2.16]} s={[0.43, 0.13, 0.04]} c="#fff0c9" glow />
          <Box p={[x, 0.76, -2.16]} s={[0.43, 0.11, 0.04]} c="#bd4632" glow />
        </group>
      ))}
      <Box p={[0, 0.47, 2.18]} s={[0.85, 0.17, 0.03]} c="#222a2e" />
    </group>
  );
}

export function Exterior({ mobile }: { mobile: boolean }) {
  const markings = useMemo(() => {
    const items: Instance[] = [];
    for (let i = 0; i < 144; i++)
      items.push({ p: [-500 + i * 7, 0.02, 27], s: [3, 0.018, 0.12] });
    for (let i = 0; i < 9; i++)
      items.push({ p: [34, 0.025, 23 + i], s: [3.6, 0.02, 0.46] });
    for (let i = 0; i < 168; i++) {
      const z = -500 + i * 6;
      if (Math.abs(z - 27) > 6) {
        items.push({ p: [30, 0.02, z], s: [0.12, 0.018, 2.5] });
        items.push({ p: [-31, 0.02, z], s: [0.12, 0.018, 2.5] });
      }
    }
    return items;
  }, []);
  return (
    <group name="exterior-city">
      <ExteriorSurfaces
        texture="ground-sand"
        surfaces={[groundSurface([0, -0.5, -25], [1400, 1400], 12)]}
      />
      <City />
      <ExteriorSurfaces
        texture="ground-asphalt"
        color="#b9b9bc"
        surfaces={[
          groundSurface([-267, -0.31, -32], [466, 8]),
          groundSurface([267, -0.31, -32], [466, 8]),
          groundSurface([0, -0.31, -65], [1000, 8]),
          groundSurface([0, -0.025, 27], [1000, 9]),
          groundSurface([30, -0.03, 0], [8, 1000]),
          groundSurface([-31, -0.03, 0], [7, 1000]),
        ]}
      />
      <ExteriorSurfaces
        texture="ground-paving-corniche"
        surfaces={[
          groundSurface([-267.25, 0.08, 35], [465.5, 6]),
          groundSurface([-0.75, 0.08, 35], [53.5, 6]),
          groundSurface([267, 0.08, 35], [466, 6]),
        ]}
      />
      {/* Pavements reach beyond the fog, with openings at both intersections. */}
      {[
        [-267.25, 465.5],
        [-0.75, 53.5],
        [267, 466],
      ].map(([x, width]) => (
        <group key={x}>
          <Box p={[x, -0.1, 35]} s={[width, 0.35, 6]} c="#bcb7a5" metal={0} />
          <Box
            p={[x, 0.04, 31.7]}
            s={[width, 0.25, 0.3]}
            c="#d3cbb8"
            metal={0}
          />
        </group>
      ))}
      <Repeated items={markings} color="#ddd8c3" metal={0} />
      <Landscaping mobile={mobile} />
      {Array.from({ length: mobile ? 3 : 6 }, (_, i) => (
        <Pedestrian key={i} index={mobile ? i + 2 : i} />
      ))}
      {Array.from({ length: mobile ? 2 : 4 }, (_, i) => (
        <Car key={i} index={i} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Car key={`park${i}`} index={i} parked />
      ))}
      <Birds />
    </group>
  );
}
