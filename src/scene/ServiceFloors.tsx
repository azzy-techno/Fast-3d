import { ElectricalFloor } from "./ElectricalFloor";
import { InteriorFloor } from "./InteriorFloor";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Box } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
import { Wayfinding, Planter, ImportedFurniture } from "./Architecture";
import { serviceRooms, journeyState } from "./journey";
import { chapters } from "../data/chapters";
import { equipment } from "./Equipment";
import { SystemAnimation } from "./SystemAnimation";

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
      {serviceRooms.map((_, i) =>
        i === 0 ? (
          <ElectricalFloor key={i} />
        ) : (
          <ServiceFloor key={i} index={i} />
        ),
      )}
    </group>
  );
}
