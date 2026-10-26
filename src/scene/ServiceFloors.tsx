import { InteriorFloor } from "./InteriorFloor";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Box, Cylinder, Pipe, Screen } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
import { Wayfinding, Planter, ImportedFurniture } from "./Architecture";
import { serviceRooms, journeyState } from "./journey";
import { chapters } from "../data/chapters";
import { equipment } from "./Equipment";
import { SystemAnimation } from "./SystemAnimation";

function ElectricalDetails() {
  return (
    <group name="electrical-installation-and-testing">
      {/* RMU bays: visible isolator handles, protection relays and cable terminations. */}
      <group position={[-12, 0, -5]}>
        <Box p={[0, 0.12, 0]} s={[3, 0.24, 2.1]} c="#68777c" />
        {[-0.95, 0, 0.95].map((x, i) => (
          <group key={x}>
            <Box
              p={[x, 1.35, 0]}
              s={[0.9, 2.45, 1.55]}
              c="#abb7b8"
              metal={0.45}
            />
            <Screen
              p={[x, 2.05, 0.79]}
              s={[0.52, 0.35, 0.03]}
              color="#97c9b5"
            />
            <Cylinder
              p={[x, 1.3, 0.82]}
              radius={0.12}
              height={0.05}
              r={[Math.PI / 2, 0, 0]}
              c="#263e45"
            />
            <Box
              p={[x, 1.3, 0.86]}
              s={[0.3, 0.055, 0.035]}
              r={[0, 0, i === 1 ? 0.6 : 0]}
              c="#d5ae58"
            />
            <Pipe
              a={[x, 0.25, 0.1]}
              b={[x, 0, 0.1]}
              radius={0.065}
              c={["#aa7948", "#414c51", "#7a8589"][i]}
            />
          </group>
        ))}
        <Wayfinding
          text="SMART RMU"
          sub="INSTALLATION / TESTING / COMMISSIONING"
          p={[0, 3, -0.7]}
          width={3.4}
        />
      </group>
      {/* Cable ladder and supported, separated LV/MV routes. */}
      {[-8.5, -7.9].map((z) => (
        <Box
          key={z}
          p={[-7, 4.6, z]}
          s={[14, 0.13, 0.045]}
          c="#8b9d9e"
          metal={0.7}
        />
      ))}
      {Array.from({ length: 32 }, (_, i) => (
        <Box
          key={i}
          p={[-13.8 + i * 0.44, 4.55, -8.2]}
          s={[0.04, 0.04, 0.65]}
          c="#acb9b8"
        />
      ))}
      {[-8.35, -8.18, -8.01].map((z, i) => (
        <Pipe
          key={z}
          a={[-13.5, 4.66, z]}
          b={[-0.4, 4.66, z]}
          radius={0.04}
          c={["#a86d45", "#39464b", "#9faaa5"][i]}
        />
      ))}
      {/* Inspection bench and a demonstrator transformer across the visitor aisle. */}
      <group position={[7, 0, -4]}>
        <Box p={[0, 0.15, 0]} s={[3.4, 0.3, 2.8]} c="#9ca5a0" />
        <Box p={[0, 1.2, 0]} s={[2.6, 1.9, 1.9]} c="#617e86" metal={0.55} />
        {[-1.45, 1.45].flatMap((x) =>
          Array.from({ length: 10 }, (_, i) => (
            <Box
              key={`${x}-${i}`}
              p={[x, 1.25, -0.8 + i * 0.18]}
              s={[0.35, 1.75, 0.06]}
              c="#8eaaa9"
              metal={0.6}
            />
          )),
        )}
        {[-0.8, 0, 0.8].map((x) => (
          <group key={x}>
            <Cylinder
              p={[x, 2.45, 0]}
              radius={0.12}
              height={0.7}
              c="#b1a78f"
              metal={0}
            />
            {[0, 1, 2, 3].map((i) => (
              <Cylinder
                key={i}
                p={[x, 2.2 + i * 0.14, 0]}
                radius={0.2}
                height={0.04}
                c="#c0b49d"
                metal={0}
              />
            ))}
          </group>
        ))}
        <Wayfinding
          text="TRANSFORMERS"
          sub="INSTALLATION / ALIGNMENT / TERMINATIONS"
          p={[0, 3.7, -5.9]}
          width={4.6}
        />
      </group>
      <group position={[5, 0, 0]}>
        <Box p={[0, 0.9, 0]} s={[4, 0.12, 1.2]} c="#b5a487" metal={0} />
        {[-1.7, 1.7].map((x) => (
          <Box key={x} p={[x, 0.45, 0]} s={[0.08, 0.9, 1]} c="#52656a" />
        ))}
        <Box p={[-0.9, 1.15, 0]} s={[0.75, 0.38, 0.5]} c="#d4ae4e" />
        <Screen p={[-0.9, 1.2, 0.26]} s={[0.48, 0.2, 0.02]} color="#bad6bf" />
        <Box p={[0.5, 1.05, 0]} s={[0.6, 0.18, 0.4]} c="#446b78" />
        <Box p={[0, 0.6, 0.57]} s={[3.3, 0.65, 0.08]} c="#1c3843" metal={0.1} />
        <Wayfinding
          text="VERIFY. COMMISSION. HAND OVER."
          sub="RMU TESTING / CABLE TESTING / DOCUMENTATION"
          p={[0, 0.6, 0.62]}
          width={3.1}
        />
      </group>
    </group>
  );
}

function ServiceFloor({ index }: { index: number }) {
  const root = useRef<Group>(null),
    room = serviceRooms[index];
  const Equipment = equipment[room.index];
  useFrame(({ camera }) => {
    if (root.current)
      root.current.visible =
        journeyState.progress > 1.73 &&
        journeyState.progress < 11.62 &&
        Math.abs(camera.position.y - room.y) < 9;
  });
  return (
    <group
      ref={root}
      position={[0, room.y, 0]}
      name={`service-floor-${room.index}`}
    >
      <group position={[0, -16, 0]}>
        <InteriorFloor office />
      </group>
      <StaticInstances>
        {/* Continuous shaft enclosure conceals the slab opening above the cabin. */}
        {[-2.18, 2.18].map((x) => (
          <Box
            key={x}
            p={[x, 3, -7]}
            s={[0.18, 6, 4.6]}
            c="#879a9b"
            metal={0.1}
          />
        ))}
        {index === 9 ? (
          <Box
            p={[0, 4.65, -9.25]}
            s={[4.5, 2.7, 0.18]}
            c="#879a9b"
            metal={0.1}
          />
        ) : (
          <Box p={[0, 3, -9.25]} s={[4.5, 6, 0.18]} c="#879a9b" metal={0.1} />
        )}
        <Box p={[0, 4.65, -4.8]} s={[4.5, 2.7, 0.18]} c="#a7b4b2" metal={0.1} />
        {[-2.0, 2.0].map((x) => (
          <Box
            key={x}
            p={[x, 1.65, -4.8]}
            s={[0.5, 3.3, 0.18]}
            c="#a7b4b2"
            metal={0.2}
          />
        ))}
        {[0, 5.6].map((y) => (
          <group key={y}>
            {[-8.95, 8.95].map((x) => (
              <Box
                key={x}
                p={[x, y - 0.15, -1]}
                s={[13.3, 0.3, 19]}
                c="#c6c7bc"
                metal={0.05}
              />
            ))}
            <Box
              p={[0, y - 0.15, 1.9]}
              s={[4.6, 0.3, 13.2]}
              c="#c6c7bc"
              metal={0.05}
            />
            <Box
              p={[0, y - 0.15, -9.9]}
              s={[4.6, 0.3, 1.2]}
              c="#c6c7bc"
              metal={0.05}
            />
          </group>
        ))}
        {[-15.7, 15.7].map((x) => (
          <Box
            key={x}
            p={[x, 2.7, -1]}
            s={[0.2, 5.4, 19]}
            c="#c6c9c0"
            metal={0.05}
          />
        ))}
        {index === 9 ? (
          [-8.95, 8.95].map((x) => (
            <Box
              key={x}
              p={[x, 2.7, -10.4]}
              s={[13.3, 5.4, 0.2]}
              c="#a7b8b5"
              metal={0.05}
            />
          ))
        ) : (
          <Box
            p={[0, 2.7, -10.4]}
            s={[31.5, 5.4, 0.2]}
            c="#a7b8b5"
            metal={0.05}
          />
        )}
        {/* Dedicated corridor and equipment bay; doors remain physical openings. */}
        <Box p={[room.x, 2.5, -7.6]} s={[8.8, 5, 0.15]} c="#b7c2ba" metal={0} />
        <Box
          p={[room.side * 2.32, 0.3, -4.8]}
          s={[0.12, 0.6, 5.5]}
          c="#b3bbb2"
        />
        {[-7.45, -5.8, -4, -2.4, -0.5].map((z) => (
          <Box
            key={z}
            p={[room.side * 2.32, 2.6, z]}
            s={[0.055, 5.2, 0.055]}
            c="#8d9f9f"
            metal={0.6}
          />
        ))}
        {[-10, -5, 0, 5, 10].map((x) => (
          <Box
            key={x}
            p={[x, 5.39, -1]}
            s={[0.07, 0.035, 16]}
            c="#f1e8d2"
            glow
          />
        ))}
        {[-1.8, 1.8].map((x) => (
          <Box
            key={x}
            p={[x, 0.025, -2.5]}
            s={[0.025, 0.02, 12]}
            c="#9abcb4"
            glow
          />
        ))}
        {Array.from({ length: 25 }, (_, i) => (
          <Box
            key={i}
            p={[room.x - 3.5 + i * 0.28, 2.8, -7.48]}
            s={[0.06, 4.4, 0.08]}
            c="#8c856e"
            metal={0.1}
          />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <Box
            key={i}
            p={[-15 + i * 2.5, 2.7, 8.4]}
            s={[0.06, 5.4, 0.1]}
            c="#899ea0"
            metal={0.6}
          />
        ))}
        {index === 9 && (
          <group>
            <Box p={[0, -0.15, -7]} s={[4.6, 0.3, 4.6]} c="#c6c7bc" />
            <Box p={[0, 4.05, -35.1]} s={[4.6, 1.5, 0.2]} c="#b5bfba" />
            {[-1.95, 1.95].map((x) => (
              <Box
                key={x}
                p={[x, 1.65, -35.1]}
                s={[0.7, 3.3, 0.2]}
                c="#a7b4b2"
              />
            ))}
            {[-1.6, 1.6].map((x) => (
              <Box
                key={x}
                p={[x, 4.55, -22]}
                s={[0.06, 0.035, 25]}
                c="#e8dbc0"
                glow
              />
            ))}
            {[-1.9, 1.9].map((x) => (
              <Box
                key={x}
                p={[x, 0.025, -22]}
                s={[0.025, 0.02, 25]}
                c="#9bbeb5"
                glow
              />
            ))}
            {[-14, -20, -26, -32].flatMap((z) =>
              [-2.18, 2.18].map((x) => (
                <Box
                  key={`${x}-${z}`}
                  p={[x, 2.3, z]}
                  s={[0.06, 4.5, 0.12]}
                  c="#879d9d"
                />
              )),
            )}

            <Box p={[0, -0.15, -22]} s={[4.4, 0.3, 27.5]} c="#b7beb6" />
            <Box p={[0, 4.7, -22]} s={[4.6, 0.2, 26]} c="#c7c9bb" />
            {[-2.3, 2.3].map((x) => (
              <Box key={x} p={[x, 2.3, -23]} s={[0.2, 4.6, 28]} c="#b5bfba" />
            ))}
          </group>
        )}
        {index === 0 && <ElectricalDetails />}
      </StaticInstances>
      <mesh position={[0, 2.7, 8.42]}>
        <planeGeometry args={[31, 5.4]} />
        <meshPhysicalMaterial
          color="#b7d6dd"
          transparent
          opacity={0.14}
          roughness={0.12}
          metalness={0.4}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <mesh
        position={[room.side * 2.32, 2.8, -4.95]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[5.1, 4.3]} />
        <meshStandardMaterial
          color="#c4dcd9"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <Wayfinding
        text={`${String(11 - index).padStart(2, "0")} / ${chapters[room.index].title.toUpperCase()}`}
        sub="FAST / ENGINEERING FLOORS"
        p={[room.x, 4.4, -7.35]}
        width={7}
      />
      {index !== 0 && (
        <Wayfinding
          text="CONNECTED ENGINEERING"
          sub={`LEVEL ${11 - index} / ${room.y} M`}
          p={[7, 4, -10.25]}
          width={7}
        />
      )}
      <Planter p={[-13, 0, 6]} scale={1.25} />
      <Planter p={[13, 0, 6]} scale={1.25} />
      <ImportedFurniture kind="sofa" p={[-8, 0, 6.5]} rotation={Math.PI} />
      <group
        position={[room.x, 0.08, room.z - 0.55]}
        scale={0.55}
        name={`service-equipment-${room.index}`}
      >
        <StaticInstances>
          <Equipment />
        </StaticInstances>
        <SystemAnimation
          index={room.index}
          color={chapters[room.index].color}
        />
      </group>
    </group>
  );
}
export function ServiceFloors() {
  return (
    <group name="stacked-service-floors">
      {serviceRooms.map((_, i) => (
        <ServiceFloor key={i} index={i} />
      ))}
    </group>
  );
}
