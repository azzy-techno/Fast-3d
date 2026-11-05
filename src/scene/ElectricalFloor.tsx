import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Box } from "./Primitives";
import { StaticInstances } from "./StaticInstances";
import { Wayfinding, Planter } from "./Architecture";
import { electricalStations, ELECTRICAL_Y } from "./electricalTour";
import { ElectricalStationModel } from "./ElectricalExhibits";
import { journeyState } from "./journey";
import { ElectricalIntro } from "./ElectricalIntro";
import { ElectricalInterior } from "./ElectricalInterior";
import { useVisibilityUpdates } from "./useVisibilityUpdates";

/** Dedicated 62 × 64 m exhibition floor. The lift core retains its real slab opening. */
export function ElectricalFloor() {
  const root = useRef<Group>(null);
  useVisibilityUpdates(root);
  useFrame(({ camera }) => {
    if (root.current)
      root.current.visible =
        journeyState.progress > 1.73 &&
        journeyState.progress < 3 &&
        camera.position.y > ELECTRICAL_Y - 1 &&
        camera.position.y < ELECTRICAL_Y + 6.2;
  });
  return (
    <group
      ref={root}
      visible={false}
      position={[0, ELECTRICAL_Y, 0]}
      name="electrical-exhibition-floor"
    >
      <StaticInstances>
        {[0, 5.6].map((y) => (
          <group key={y}>
            <Box
              p={[0, y - 0.16, 24.65]}
              s={[62, 0.32, 58.7]}
              c={y ? "#293b43" : "#b9b09d"}
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
          <Box key={x} p={[x, 2.7, 21.8]} s={[0.25, 5.4, 64.4]} c="#c9c2b2" />
        ))}
        <Box p={[0, 2.7, -10.4]} s={[62, 5.4, 0.25]} c="#c9c2b2" />
        {/* Rear exit opening beside the final bay; no return to the entrance. */}
        <Box p={[-27.15, 2.7, 54]} s={[7.7, 5.4, 0.25]} c="#b6c4bc" />
        <Box p={[6.15, 2.7, 54]} s={[49.7, 5.4, 0.25]} c="#b6c4bc" />
        <Box p={[-21, 4.65, 54]} s={[4.6, 1.5, 0.25]} c="#b6c4bc" />
        {/* The cabin travels through a real slab opening, not through a floor. */}
        <Box p={[-21, -0.16, 55.1]} s={[4.6, 0.32, 2.2]} c="#c0c6bc" />
        <Box p={[-21, 5.44, 57.2]} s={[4.6, 0.32, 6.4]} c="#bcc7bf" />
        {[-23.3, -18.7].map((x) => (
          <Box key={x} p={[x, 2.7, 57.2]} s={[0.2, 5.4, 6.4]} c="#9fb3b3" />
        ))}
        <Box p={[-21, 2.7, 60.4]} s={[4.6, 5.4, 0.2]} c="#9fb3b3" />
        <Wayfinding
          text="NEXT DESTINATION"
          sub="EXIT LIFT / CHOOSE YOUR FLOOR"
          p={[-21, 4.15, 53.8]}
          rotation={[0, Math.PI, 0]}
          width={4.3}
          height={0.8}
        />
        {/* Sealed shaft, shared with all lower floors. */}
        {[-2.18, 2.18].map((x) => (
          <Box key={x} p={[x, 3, -7]} s={[0.18, 6, 4.6]} c="#879a9b" />
        ))}
        <Box p={[0, 3, -9.25]} s={[4.5, 6, 0.18]} c="#879a9b" />
        <Box p={[0, 4.65, -4.8]} s={[4.5, 2.7, 0.18]} c="#a7b4b2" />
        {[-2, 2].map((x) => (
          <Box key={x} p={[x, 1.65, -4.8]} s={[0.5, 3.3, 0.18]} c="#a7b4b2" />
        ))}
        {/* Floor inlays mark the cross aisles and central promenade. */}
        {[3, 15, 27, 39, 51].map((z) => (
          <group key={z}>
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
            {/* Open gallery portals keep the equipment in silhouette and let
                visitors see through the hall, instead of sixteen solid walls. */}
            <Box p={[0, 0.08, 0]} s={[9, 0.16, 5]} c="#45565e" metal={0.3} />
            <Box p={[0, 0.12, 2.48]} s={[8.8, 0.035, 0.035]} c="#d4bd88" glow />
            {[-4.35, 4.35].map((x) => (
              <group key={x}>
                <Box
                  p={[x, 2.35, -2.4]}
                  s={[0.12, 4.7, 0.18]}
                  c="#33444b"
                  metal={0.65}
                />
                <Box
                  p={[x, 2.4, -2.29]}
                  s={[0.025, 3.8, 0.025]}
                  c="#d8c99d"
                  glow
                />
              </group>
            ))}
            <Box
              p={[0, 4.68, -2.4]}
              s={[8.82, 0.12, 0.18]}
              c="#33444b"
              metal={0.65}
            />
            <Box p={[0, 4.6, -2.32]} s={[8.5, 0.025, 0.06]} c="#e3c889" glow />
            {/* A shallow stone base and a small fin screen anchor the bay;
                the middle remains open behind each installation. */}
            <Box p={[0, 0.36, -2.35]} s={[8.6, 0.4, 0.25]} c="#b9b4a4" />
            {[0, 1, 2, 3, 4].map((fin) => (
              <Box
                key={fin}
                p={[-4.05 + fin * 0.18, 2.1, -2.35]}
                s={[0.065, 3.05, 0.22]}
                c="#a3957d"
                metal={0.25}
              />
            ))}
            <group position={[0, 0.16, 0]}>
              <ElectricalStationModel index={i} />
            </group>
            <Wayfinding
              text={`${String(s.number).padStart(2, "0")} / ${s.title.toUpperCase()}`}
              sub={s.category.toUpperCase()}
              p={[0, 4.15, -2.25]}
              width={8.5}
              height={1}
            />
          </group>
        ))}
        <Wayfinding
          text="CONTRACTING / AUTOMATION / LV + ELV"
          sub="FAST O&M / ENGINEERING FLOORS"
          p={[0, 3, 53.7]}
          rotation={[0, Math.PI, 0]}
          width={18}
          height={1.3}
        />
      </StaticInstances>
      <ElectricalInterior />
      <ElectricalIntro />
      {[-29, 29].flatMap((x) =>
        [1, 25, 51].map((z) => (
          <Planter key={`${x}-${z}`} p={[x, 0, z]} scale={0.7} />
        )),
      )}
    </group>
  );
}
