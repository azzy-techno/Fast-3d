import { useEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  SpotLight,
  Vector2,
  MathUtils,
} from "three";
import { Box, Cylinder, Pipe } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
import { Wayfinding } from "./Architecture";
import { electricalStations, electricalStationAt } from "./electricalTour";
import { journeyState } from "./journey";
import { assetUrl } from "../lib/assets";
import type { Point } from "../data/chapters";

const unitBox = new BoxGeometry(1, 1, 1);
const floorPieces = [
  { p: [0, 0.012, 24.65], size: [62, 0.016, 58.7] },
  { p: [-16.65, 0.012, -7.55], size: [28.7, 0.016, 5.7] },
  { p: [16.65, 0.012, -7.55], size: [28.7, 0.016, 5.7] },
  { p: [0, 0.012, -9.9], size: [4.6, 0.016, 1] },
  { p: [-21, 0.012, 55.1], size: [4.6, 0.016, 2.2] },
] as { p: Point; size: Point }[];

function useFinishes() {
  const maps = useTexture(
    ["limestone", "travertine", "acoustic"].flatMap((name) =>
      ["color", "normal", "roughness"].map((channel) =>
        assetUrl(`electrical/materials/${name}-${channel}.webp`),
      ),
    ),
  );
  const finishes = useMemo(() => {
    const owned = maps.map((t) => t.clone());
    owned.forEach((t, i) => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = 4;
      if (i % 3 === 0) t.colorSpace = SRGBColorSpace;
      t.needsUpdate = true;
    });
    const make = (
      index: number,
      repeats: [number, number],
      color = "#ffffff",
    ) => {
      const textures = owned.slice(index, index + 3).map((t) => {
        const clone = t.clone();
        clone.repeat.set(...repeats);
        clone.needsUpdate = true;
        return clone;
      });
      const material = new MeshStandardMaterial({
        color,
        map: textures[0],
        normalMap: textures[1],
        roughnessMap: textures[2],
        normalScale: new Vector2(0.4, 0.4),
        roughness: 1,
        metalness: 0.06,
      });
      return { material, textures };
    };
    const floor = floorPieces.map(({ p, size }) => {
      const surface = make(0, [size[0] / 3, size[2] / 3]);
      // Align grout across the landing pieces without bridging either shaft.
      surface.textures.forEach((t) =>
        t.offset.set((p[0] - size[0] / 2) / 3, -(p[2] + size[2] / 2) / 3),
      );
      return surface;
    });
    const wall = make(3, [1, 1.4]);
    const ceiling = make(6, [10, 8]);
    const plinth = make(0, [3, 2], "#7c9298");
    return {
      floor,
      wall,
      ceiling,
      plinth,
      dispose() {
        owned.forEach((t) => t.dispose());
        [...floor, wall, ceiling, plinth].forEach((s) => {
          s.material.dispose();
          s.textures.forEach((t) => t.dispose());
        });
      },
    };
  }, maps);
  useEffect(() => () => finishes.dispose(), [finishes]);
  return finishes;
}

/** Detailed finishes and MEP fit-out; every solid stays above the route or on its perimeter. */
export function ElectricalInterior() {
  const finish = useFinishes();
  return (
    <group name="electrical-interior-fitout">
      {/* Horizontal planes give the floor maps consistent, unstretched world scale. */}
      {floorPieces.map(({ p, size }, i) => (
        <mesh
          key={i}
          position={p}
          rotation={[-Math.PI / 2, 0, 0]}
          material={finish.floor[i].material}
          receiveShadow
        >
          <planeGeometry args={[size[0], size[2]]} />
        </mesh>
      ))}
      <StaticInstances>
        {/* Individually framed acoustic ceiling clouds, with recessed warm coves. */}
        {electricalStations.map((s) => (
          <group key={s.number} position={[s.x, 0, s.z]}>
            <mesh
              geometry={unitBox}
              material={finish.ceiling.material}
              position={[0, 5.16, 0.6]}
              scale={[9, 0.16, 7.6]}
              receiveShadow
            />
            {[-4.7, 4.7].map((x) => (
              <group key={x}>
                <Box
                  p={[x, 5.06, 0.6]}
                  s={[0.22, 0.26, 8.2]}
                  c="#39454a"
                  metal={0.55}
                />
                <Box
                  p={[x * 0.96, 5.02, 0.6]}
                  s={[0.045, 0.035, 7.9]}
                  c="#f1d8a3"
                  glow
                />
              </group>
            ))}
            {[-3.4, 4.6].map((z) => (
              <group key={z}>
                <Box
                  p={[0, 5.06, z]}
                  s={[9.6, 0.26, 0.22]}
                  c="#39454a"
                  metal={0.55}
                />
                <Box
                  p={[0, 5.02, z + (z < 0 ? 0.14 : -0.14)]}
                  s={[9.1, 0.035, 0.045]}
                  c="#f1d8a3"
                  glow
                />
              </group>
            ))}
            {/* Supply diffuser and recessed downlights, separate from the exhibit. */}
            <Box p={[0, 5.035, 2.7]} s={[3.3, 0.1, 0.65]} c="#283b43" />
            {Array.from({ length: 14 }, (_, i) => (
              <Box
                key={i}
                p={[-1.5 + i * 0.23, 4.975, 2.7]}
                s={[0.055, 0.025, 0.6]}
                c="#aeb8b2"
                metal={0.55}
              />
            ))}
            {[-3.4, 3.4].map((x) => (
              <group key={x}>
                <Cylinder
                  p={[x, 4.97, 1]}
                  radius={0.19}
                  height={0.16}
                  c="#263a43"
                />
                <Box
                  p={[x, 4.88, 1]}
                  s={[0.23, 0.025, 0.23]}
                  c="#fff0d4"
                  glow
                />
              </group>
            ))}
            {/* Textured equipment pad and inset footlights leave the guide aisle clear. */}
            <mesh
              geometry={unitBox}
              material={finish.plinth.material}
              position={[0, 0.17, 0]}
              scale={[8.85, 0.025, 4.85]}
              receiveShadow
            />
            {[-4.15, 4.15].map((x) => (
              <Box
                key={x}
                p={[x, 0.19, 0]}
                s={[0.025, 0.012, 4.3]}
                c="#cfb36d"
              />
            ))}
            <Box p={[0, 0.2, 2.3]} s={[8.3, 0.015, 0.035]} c="#cfb36d" />
            {/* Low, side-mounted description lectern; never in the presentation lane. */}
            <Box
              p={[-3.7, 0.52, 1.6]}
              s={[0.1, 1, 0.1]}
              c="#314a53"
              metal={0.65}
            />
            <Box
              p={[-3.7, 1.05, 1.6]}
              s={[1.05, 0.08, 0.65]}
              r={[-0.28, 0, 0]}
              c="#243e49"
            />
            <Wayfinding
              text={
                String(s.number).padStart(2, "0") +
                " / " +
                s.category.toUpperCase()
              }
              sub="FAST O&M / INSTALLATION DEMONSTRATOR"
              p={[-3.7, 1.11, 1.6]}
              rotation={[-Math.PI / 2 + 0.28, 0, 0]}
              width={1}
              height={0.5}
            />
          </group>
        ))}
        {/* Longitudinal exposed service spines between the ceiling clouds. */}
        {[-14, 0, 14].map((x) => (
          <group key={x}>
            <Box
              p={[x, 4.97, x === 0 ? 29 : 26]}
              s={[0.9, 0.42, x === 0 ? 46 : 52]}
              c="#849594"
              metal={0.7}
            />
            {Array.from({ length: 14 }, (_, i) => i)
              .filter((i) => x !== 0 || i >= 2)
              .map((i) => (
                <group key={i}>
                  <Box
                    p={[x, 4.97, i * 4]}
                    s={[0.96, 0.46, 0.045]}
                    c="#bac4bd"
                    metal={0.75}
                  />
                  <Box
                    p={[x, 4.72, i * 4]}
                    s={[1.3, 0.06, 0.1]}
                    c="#3f535b"
                    metal={0.6}
                  />
                  {[-0.6, 0.6].map((dx) => (
                    <Cylinder
                      key={dx}
                      p={[x + dx, 5.08, i * 4]}
                      radius={0.015}
                      height={0.7}
                      c="#65787d"
                    />
                  ))}
                </group>
              ))}
          </group>
        ))}
        {/* Cable ladder trays: rails, rungs, supported cable bundles. */}
        {[-28, 28].map((x) => (
          <group key={x}>
            {[-0.38, 0.38].map((dx) => (
              <Box
                key={dx}
                p={[x + dx, 4.82, 25]}
                s={[0.045, 0.16, 54]}
                c="#a6b7b3"
                metal={0.7}
              />
            ))}
            {Array.from({ length: 68 }, (_, i) => (
              <Box
                key={i}
                p={[x, 4.75, -1.5 + i * 0.8]}
                s={[0.8, 0.04, 0.055]}
                c="#a6b7b3"
                metal={0.7}
              />
            ))}
            {[-0.2, 0, 0.2].map((dx, i) => (
              <Pipe
                key={dx}
                a={[x + dx, 4.86, -1.5]}
                b={[x + dx, 4.86, 52]}
                radius={0.045}
                c={["#263b48", "#40666a", "#84754e"][i]}
              />
            ))}
          </group>
        ))}
        {/* Sprinkler pipe and drops are architectural details, not service telemetry. */}
        {[3, 15, 27, 39, 51].map((z) => (
          <group key={z}>
            <Pipe
              a={[-29, 5.1, z]}
              b={[29, 5.1, z]}
              radius={0.045}
              c="#794d41"
            />
            {[-21, -7, 7, 21].map((x) => (
              <group key={x}>
                <Cylinder
                  p={[x, 4.92, z]}
                  radius={0.028}
                  height={0.34}
                  c="#bba779"
                />
                <Cylinder
                  p={[x, 4.75, z]}
                  radius={0.08}
                  height={0.025}
                  c="#bba779"
                />
              </group>
            ))}
          </group>
        ))}
        {/* Perimeter stone panels, joints, skirtings and timber acoustic strips. */}
        {[-1, 1].map((side) => (
          <group key={side}>
            {Array.from({ length: 21 }, (_, i) => (
              <mesh
                key={i}
                geometry={unitBox}
                material={finish.wall.material}
                position={[side * 30.82, 2.6, -8.5 + i * 3]}
                scale={[0.1, 4.65, 2.95]}
                receiveShadow
              />
            ))}
            <Box
              p={[side * 30.69, 0.17, 21.8]}
              s={[0.12, 0.3, 64]}
              c="#344b53"
              metal={0.65}
            />
            <Box
              p={[side * 30.65, 4.98, 21.8]}
              s={[0.045, 0.06, 64]}
              c="#ead2a5"
              glow
            />
            {[0, 12, 24, 36, 48].map((z) => (
              <group key={z}>
                <Box
                  p={[side * 30.7, 2.6, z]}
                  s={[0.15, 4.55, 2.35]}
                  c="#4d4940"
                />
                {Array.from({ length: 13 }, (_, j) => (
                  <Box
                    key={j}
                    p={[side * 30.57, 2.6, z - 1.08 + j * 0.18]}
                    s={[0.13, 4.45, 0.065]}
                    c="#9e8c6f"
                    metal={0.05}
                  />
                ))}
                <Box
                  p={[side * 30.55, 2.6, z + 1.25]}
                  s={[0.045, 4.45, 0.045]}
                  c="#eedcb5"
                  glow
                />
              </group>
            ))}
          </group>
        ))}
        {/* Front feature wall faces all four rows; panels are grounded by a dark dado. */}
        {Array.from({ length: 20 }, (_, i) => (
          <mesh
            key={i}
            geometry={unitBox}
            material={finish.wall.material}
            position={[-28.5 + i * 3, 2.6, -10.22]}
            scale={[2.94, 4.7, 0.12]}
            receiveShadow
          />
        ))}
        <Box
          p={[0, 0.25, -10.08]}
          s={[61, 0.5, 0.18]}
          c="#344b53"
          metal={0.55}
        />
        {[-28, -14, 14, 28].map((x) => (
          <Box
            key={x}
            p={[x, 2.6, -10.1]}
            s={[0.055, 4.6, 0.04]}
            c="#e8d2ad"
            glow
          />
        ))}
        {/* Rear vestibule is finished on every side, with its actual shaft opening preserved. */}
        {Array.from({ length: 20 }, (_, i) => -28.5 + i * 3)
          .filter((x) => x < -24 || x > -18)
          .map((x) => (
            <mesh
              key={x}
              geometry={unitBox}
              material={finish.wall.material}
              position={[x, 2.6, 53.83]}
              scale={[2.94, 4.7, 0.12]}
              receiveShadow
            />
          ))}
        {[-23.12, -18.88].map((x) => (
          <group key={x}>
            <Box
              p={[x, 2.25, 55]}
              s={[0.12, 4.4, 1.9]}
              c="#b7ad96"
              metal={0.1}
            />
            <Box
              p={[x, 2.25, 54.15]}
              s={[0.045, 4.2, 0.045]}
              c="#f1d5a1"
              glow
            />
            <Box p={[x, 0.22, 55]} s={[0.14, 0.4, 1.9]} c="#344b53" />
          </group>
        ))}
        <Box p={[-21, 5.15, 55]} s={[4.1, 0.18, 1.8]} c="#39454a" />
        <Box p={[-21, 5.04, 55]} s={[3.7, 0.025, 0.12]} c="#f1d5a1" glow />
        {/* Entrance arch frames the intro rather than leaving it as a floating sign. */}
        <Box p={[0, 5.18, 0.2]} s={[10, 0.16, 6]} c="#3b484a" />
        {Array.from({ length: 33 }, (_, i) => (
          <Box
            key={i}
            p={[-4.8 + i * 0.3, 5.02, 0.2]}
            s={[0.06, 0.18, 5.8]}
            c="#a08b69"
            metal={0.1}
          />
        ))}
        {[-5.1, 5.1].map((x) => (
          <group key={x}>
            <Box
              p={[x, 2.6, 3.9]}
              s={[0.22, 5.2, 0.5]}
              c="#5a655f"
              metal={0.5}
            />
            <Box p={[x, 2.6, 3.62]} s={[0.045, 4.9, 0.045]} c="#ecd0a0" glow />
          </group>
        ))}
        <Box p={[0, 5.13, 3.9]} s={[10.4, 0.25, 0.5]} c="#5a655f" metal={0.5} />
        <Box p={[0, 0.12, 3.9]} s={[10.3, 0.24, 0.8]} c="#515b56" />
        {/* Slim wall-side resting benches stay beyond the outer guide lane. */}
        {[-1, 1].flatMap((side) =>
          [18, 42].map((z) => (
            <group key={`${side}-${z}`}>
              <Box
                p={[side * 30.1, 0.25, z]}
                s={[0.72, 0.5, 2.8]}
                c="#344b53"
              />
              <Box
                p={[side * 30, 0.55, z]}
                s={[0.8, 0.16, 2.9]}
                c="#a58b63"
                metal={0}
              />
              <Box
                p={[side * 30.5, 0.94, z]}
                s={[0.13, 0.8, 2.9]}
                c="#8b775b"
                metal={0}
              />
              <Box
                p={[side * 30.55, 1.5, z]}
                s={[0.07, 0.18, 0.38]}
                c="#30464e"
              />
            </group>
          )),
        )}
      </StaticInstances>
      {/* Sparse room labels avoid repeating a wall behind every installation. */}
      <Wayfinding
        text="POWER / CONTROL / CONNECTION"
        sub="FAST ELECTRICAL / ENGINEERING GALLERY"
        p={[-17, 3.1, -10.02]}
        width={15}
        height={1.6}
      />
      <Wayfinding
        text="FROM INSTALLATION TO OPERATION"
        sub="16 CAPABILITIES / ONE CONNECTED FLOOR"
        p={[17, 3.1, -10.02]}
        width={15}
        height={1.6}
      />
      <ElectricalExhibitLight />
      <PortfolioFrames />
    </group>
  );
}

function PortfolioFrames() {
  const photos = useTexture(
    ["contracting.webp", "automation.webp", "installation.webp"].map((name) =>
      assetUrl(`electrical/${name}`),
    ),
  );
  return (
    <group name="electrical-portfolio-gallery">
      {[-1, 1].flatMap((side, i) =>
        [18, 42].map((z, j) => (
          <group
            key={`${side}-${z}`}
            position={[side * 30.48, 2.8, z]}
            rotation={[0, (-side * Math.PI) / 2, 0]}
          >
            <Box
              p={[0, 0, -0.04]}
              s={[4, 2.65, 0.09]}
              c="#2c4149"
              metal={0.6}
            />
            <mesh position={[0, 0.1, 0.02]}>
              <planeGeometry args={[3.8, 2.25]} />
              <meshBasicMaterial
                map={photos[(i * 2 + j) % photos.length]}
                toneMapped={false}
              />
            </mesh>
            <Wayfinding
              text="FAST O&M / PROJECT PORTFOLIO"
              sub="ELECTRICAL ENGINEERING"
              p={[0, -1.14, 0.025]}
              width={3.8}
              height={0.28}
            />
            <Box
              p={[0, 1.4, 0.18]}
              s={[3.6, 0.08, 0.32]}
              c="#40555b"
              metal={0.7}
            />
            <Box p={[0, 1.35, 0.22]} s={[3.4, 0.02, 0.16]} c="#efddbd" glow />
          </group>
        )),
      )}
    </group>
  );
}

/** One shadowed key light follows the active bay; avoids sixteen shadow maps. */
function ElectricalExhibitLight() {
  const key = useRef<SpotLight>(null),
    fill = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  useFrame((_, dt) => {
    if (journeyState.progress < 1.73 || journeyState.progress >= 3) return;
    const station = electricalStationAt(journeyState.progress);
    if (!key.current || !fill.current) return;
    const x = station?.x ?? 0,
      z = station?.z ?? 3;
    target.position.x = MathUtils.damp(
      target.position.x,
      x,
      7,
      Math.min(dt, 0.1),
    );
    target.position.z = MathUtils.damp(
      target.position.z,
      z,
      7,
      Math.min(dt, 0.1),
    );
    target.position.y = 1.3;
    target.updateMatrixWorld();
    key.current.position.set(
      target.position.x - 2.8,
      4.85,
      target.position.z + 2.4,
    );
    fill.current.position.set(
      target.position.x + 3.2,
      4.85,
      target.position.z + 1,
    );
    key.current.intensity = MathUtils.damp(
      key.current.intensity,
      station ? 115 : 35,
      7,
      Math.min(dt, 0.1),
    );
    fill.current.intensity = MathUtils.damp(
      fill.current.intensity,
      station ? 65 : 20,
      7,
      Math.min(dt, 0.1),
    );
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={key}
        target={target}
        color="#ffebc9"
        intensity={115}
        angle={0.85}
        penumbra={0.75}
        distance={16}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <spotLight
        ref={fill}
        target={target}
        color="#b9dce8"
        intensity={65}
        angle={0.9}
        penumbra={0.8}
        distance={15}
        decay={2}
      />
    </>
  );
}
