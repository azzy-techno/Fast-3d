import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Box } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
import { Wayfinding, Planter } from "./Architecture";
import { electricalStations, ELECTRICAL_Y } from "./electricalTour";
import { ElectricalStationModel } from "./ElectricalExhibits";
import { journeyState } from "./journey";

/** Dedicated 62 × 64 m exhibition floor. The lift core retains its real slab opening. */
export function ElectricalFloor() {
  const root = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (root.current)
      root.current.visible =
        journeyState.progress > 1.73 &&
        journeyState.progress < 3 &&
        Math.abs(camera.position.y - ELECTRICAL_Y) < 9;
  });
  return (
    <group
      ref={root}
      position={[0, ELECTRICAL_Y, 0]}
      name="electrical-exhibition-floor"
    >
      <StaticInstances>
        {[0, 5.6].map((y) => (
          <group key={y}>
            <Box
              p={[0, y - 0.16, 24.65]}
              s={[62, 0.32, 58.7]}
              c={y ? "#bcc7bf" : "#c0c6bc"}
              metal={0.12}
            />
            {[-16.65, 16.65].map((x) => (
              <Box
                key={x}
                p={[x, y - 0.16, -7.55]}
                s={[28.7, 0.32, 5.7]}
                c="#b9c4be"
              />
            ))}
            <Box p={[0, y - 0.16, -9.9]} s={[4.6, 0.32, 1]} c="#b9c4be" />
          </group>
        ))}
        {[-31, 31].map((x) => (
          <Box key={x} p={[x, 2.7, 21.8]} s={[0.25, 5.4, 64.4]} c="#9fb3b3" />
        ))}
        <Box p={[0, 2.7, -10.4]} s={[62, 5.4, 0.25]} c="#9fb3b3" />
        <Box p={[0, 2.7, 54]} s={[62, 5.4, 0.25]} c="#b6c4bc" />
        {/* Sealed shaft, shared with all lower floors. */}
        {[-2.18, 2.18].map((x) => (
          <Box key={x} p={[x, 3, -7]} s={[0.18, 6, 4.6]} c="#879a9b" />
        ))}
        <Box p={[0, 3, -9.25]} s={[4.5, 6, 0.18]} c="#879a9b" />
        <Box p={[0, 4.65, -4.8]} s={[4.5, 2.7, 0.18]} c="#a7b4b2" />
        {[-2, 2].map((x) => (
          <Box key={x} p={[x, 1.65, -4.8]} s={[0.5, 3.3, 0.18]} c="#a7b4b2" />
        ))}
        {/* Full-width light ribbons, generous peripheral aisles and central promenade. */}
        {[3, 15, 27, 39, 51].map((z) => (
          <group key={z}>
            <Box p={[0, 5.38, z]} s={[57, 0.05, 0.16]} c="#e4d7b7" glow />
            <Box p={[0, 0.018, z + 1]} s={[57, 0.015, 0.04]} c="#ba9d60" />
          </group>
        ))}
        {[-27.8, 0, 27.8].map((x) => (
          <Box key={x} p={[x, 0.02, 24]} s={[0.05, 0.015, 58]} c="#b79f65" />
        ))}
        {electricalStations.map((s, i) => (
          <group
            key={s.number}
            position={[s.x, 0, s.z]}
            name={`electrical-station-${s.number}`}
          >
            <Box p={[0, 0.08, 0]} s={[9, 0.16, 5]} c="#68878e" />
            <Box
              p={[0, 2.3, -2.4]}
              s={[9, 4.6, 0.16]}
              c={i < 10 ? "#426572" : i < 13 ? "#356d70" : "#51695c"}
            />
            <Box p={[0, 4.65, -2.3]} s={[9.1, 0.08, 0.25]} c="#e3c889" glow />
            <group position={[0, 0.16, 0]}>
              <ElectricalStationModel index={i} />
            </group>
            <Wayfinding
              text={`${String(s.number).padStart(2, "0")} / ${s.title.toUpperCase()}`}
              sub={s.category.toUpperCase()}
              p={[0, 4.05, -2.25]}
              width={8.5}
            />
          </group>
        ))}
        <Wayfinding
          text="11 / THE ELECTRICAL EXHIBITION"
          sub="16 CAPABILITIES / FOLLOW YOUR FAST ENGINEER"
          p={[10, 4.1, -9.9]}
          width={12}
        />
        <Wayfinding
          text="CONTRACTING / AUTOMATION / LV + ELV"
          sub="FAST O&M / ENGINEERING FLOORS"
          p={[0, 3, 53.7]}
          width={18}
        />
      </StaticInstances>
      {[-29, 29].flatMap((x) =>
        [1, 25, 51].map((z) => (
          <Planter key={`${x}-${z}`} p={[x, 0, z]} scale={0.7} />
        )),
      )}
    </group>
  );
}
