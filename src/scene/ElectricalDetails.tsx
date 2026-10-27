import { Box, Cylinder, Pipe, Screen } from "./Primitives";
import { Wayfinding } from "./Architecture";

function DistributionCabinet({
  x,
  z,
  small = false,
}: {
  x: number;
  z: number;
  small?: boolean;
}) {
  const h = small ? 1.1 : 1.9;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.09, 0]} s={[1.25, 0.18, 0.85]} c="#5d7379" />
      <Box
        p={[0, h / 2 + 0.18, 0]}
        s={[1.1, h, 0.65]}
        c="#b6c5c3"
        metal={0.45}
      />
      <Box p={[0, h + 0.23, 0]} s={[1.18, 0.1, 0.75]} c="#718990" />
      <Box p={[0.38, h / 2 + 0.18, 0.35]} s={[0.045, 0.22, 0.05]} c="#273c44" />
      <Box p={[0, 0.42, 0.34]} s={[0.8, 0.18, 0.03]} c="#65787d" />
      <Screen p={[0, h - 0.08, 0.34]} s={[0.4, 0.2, 0.025]} color="#b9d5c7" />
    </group>
  );
}

function AutomationWall() {
  return (
    <group
      name="energy-management-and-smart-metering"
      position={[11.8, 0, -8.8]}
    >
      <Box p={[0, 1.6, 0]} s={[4.9, 3.2, 0.45]} c="#244551" metal={0.15} />
      <Wayfinding
        text="02 / ELECTRICAL AUTOMATION"
        sub="ENERGY EFFICIENCY / SMART METERING / COMMISSIONING"
        p={[0, 3.9, -0.9]}
        width={5.4}
      />
      {[-1.65, -0.55, 0.55].map((x) => (
        <group key={x}>
          <Box p={[x, 2.15, 0.32]} s={[0.82, 1.1, 0.2]} c="#d6d8cd" />
          <Screen p={[x, 2.35, 0.43]} s={[0.53, 0.35, 0.03]} color="#9ecdc1" />
          {[0, 1, 2].map((i) => (
            <Cylinder
              key={i}
              p={[x - 0.19 + i * 0.19, 1.94, 0.44]}
              radius={0.035}
              height={0.03}
              r={[Math.PI / 2, 0, 0]}
              c="#435962"
            />
          ))}
          <Pipe
            a={[x, 1.58, 0.3]}
            b={[x, 0.4, 0.3]}
            radius={0.045}
            c="#788c92"
          />
        </group>
      ))}
      {/* Cutaway capacitor bank: a conceptual power-factor management display. */}
      <Box p={[1.65, 1.65, 0.37]} s={[0.95, 2.65, 0.3]} c="#789193" />
      {[0.65, 1.35, 2.05].flatMap((y) =>
        [-0.2, 0.2].map((x) => (
          <Cylinder
            key={`${x}-${y}`}
            p={[1.65 + x, y, 0.68]}
            radius={0.12}
            height={0.46}
            c="#c4b98e"
          />
        )),
      )}
      <Wayfinding
        text="METERING + POWER FACTOR"
        sub="ILLUSTRATIVE EQUIPMENT / NO LIVE READINGS"
        p={[0, 0.3, 0.28]}
        width={4.5}
      />
    </group>
  );
}

function InfrastructureDisplay() {
  return (
    <group
      name="lighting-and-industrial-fan-installation"
      position={[11.7, 0, 0.2]}
    >
      <Box p={[0, 0.07, 0]} s={[5.4, 0.14, 2.8]} c="#526e77" />
      {/* Outdoor luminaire, interior linear fixture and industrial high-bay. */}
      <Cylinder p={[2, 2, 0]} radius={0.065} height={3.8} c="#809da4" />
      <Pipe a={[2, 3.9, 0]} b={[1.3, 4.15, 0]} radius={0.055} c="#809da4" />
      <Box p={[1.15, 4.13, 0]} s={[0.75, 0.12, 0.35]} c="#263f49" />
      <Box p={[1.15, 4.06, 0]} s={[0.6, 0.035, 0.23]} c="#f0e0bb" glow />
      <Pipe a={[-0.3, 5.3, 0]} b={[-0.3, 4.2, 0]} radius={0.018} c="#3b5057" />
      <Cylinder p={[-0.3, 4.1, 0]} radius={0.45} height={0.18} c="#354e59" />
      <Cylinder
        p={[-0.3, 4, 0]}
        radius={0.37}
        height={0.025}
        c="#eee0c1"
        metal={0}
      />
      <Box p={[0, 5.15, -2]} s={[3.5, 0.1, 0.18]} c="#eddfbd" glow />
      {/* Guarded industrial axial-fan assembly, deliberately stationary for display. */}
      <group position={[-1.5, 1.7, 0]}>
        <Box p={[0, 0, 0]} s={[1.6, 1.6, 0.65]} c="#98b2b6" />
        <Cylinder
          p={[0, 0, 0.35]}
          radius={0.67}
          height={0.06}
          r={[Math.PI / 2, 0, 0]}
          c="#253e49"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <Box
              p={[0.28, 0.1, 0.4]}
              s={[0.55, 0.17, 0.045]}
              r={[0.2, 0, 0.4]}
              c="#a6bab8"
            />
          </group>
        ))}
        <Cylinder
          p={[0, 0, 0.45]}
          radius={0.16}
          height={0.1}
          r={[Math.PI / 2, 0, 0]}
          c="#d1bc8a"
        />
        {[-0.45, -0.225, 0, 0.225, 0.45].flatMap((d) => [
          <Box
            key={`v${d}`}
            p={[d, 0, 0.53]}
            s={[0.018, 1.22, 0.018]}
            c="#74929a"
          />,
          <Box
            key={`h${d}`}
            p={[0, d, 0.53]}
            s={[1.22, 0.018, 0.018]}
            c="#74929a"
          />,
        ])}
      </group>
      <Wayfinding
        text="03 / LV & ELV INFRASTRUCTURE"
        sub="INDUSTRIAL + INDOOR / OUTDOOR LIGHTING / INDUSTRIAL FANS"
        p={[0, 0.45, 1.3]}
        width={5}
      />
    </group>
  );
}

function CableAndConnectionDisplay() {
  return (
    <group name="cable-jointing-and-distribution" position={[-10.5, 0, 1.6]}>
      <Box p={[0, 0.08, 0]} s={[7, 0.16, 2.2]} c="#536d75" />
      <DistributionCabinet x={-2.5} z={0} />
      <DistributionCabinet x={-1} z={0} small />
      <Box p={[1.5, 0.9, 0]} s={[2.8, 0.1, 1.4]} c="#bcae8e" />
      {[-0.6, 0.6].map((z) => (
        <Box key={z} p={[1.5, 0.46, z]} s={[2.5, 0.82, 0.06]} c="#728a8b" />
      ))}
      {[0, 1, 2].map((i) => (
        <group key={i}>
          <Pipe
            a={[0.3, 1.04, -0.4 + i * 0.4]}
            b={[2.7, 1.04, -0.4 + i * 0.4]}
            radius={0.065}
            c="#304954"
          />
          <Pipe
            a={[1.15, 1.04, -0.4 + i * 0.4]}
            b={[1.85, 1.04, -0.4 + i * 0.4]}
            radius={0.11}
            c={["#a38458", "#798e93", "#35444e"][i]}
          />
        </group>
      ))}
      <Wayfinding
        text="CABLES + DISTRIBUTION"
        sub="PULLING / JOINTING / TERMINATION / FEEDER + MINI PILLARS"
        p={[0, 0.42, 1.12]}
        width={6.6}
      />
    </group>
  );
}

function GeneratorDisplay() {
  return (
    <group name="generator-to-db-connection" position={[12, 0, -4.4]}>
      <Box p={[0, 0.14, 0]} s={[3.7, 0.28, 1.9]} c="#405c66" />
      <Box p={[-0.4, 1, 0]} s={[2.5, 1.5, 1.6]} c="#d1bc83" />
      <Box p={[-0.95, 1, 0.82]} s={[0.95, 1.1, 0.04]} c="#3c535a" />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          p={[-0.95, 0.58 + i * 0.1, 0.86]}
          s={[0.86, 0.025, 0.04]}
          c="#9fafa8"
        />
      ))}
      <Screen p={[0.3, 1.3, 0.82]} s={[0.4, 0.25, 0.035]} color="#a3c9be" />
      <Pipe a={[-0.6, 1.75, 0]} b={[-0.6, 2.25, 0]} radius={0.07} c="#6c858e" />
      <DistributionCabinet x={2.3} z={0} small />
      <Pipe a={[0.7, 0.3, 0.7]} b={[2.3, 0.3, 0.7]} radius={0.07} c="#293e48" />
      <Pipe
        a={[2.3, 0.3, 0.7]}
        b={[2.3, 0.55, 0.3]}
        radius={0.07}
        c="#293e48"
      />
      <Wayfinding
        text="GENERATOR → DB"
        sub="TERMINATION / CONNECTION / PREVENTIVE MAINTENANCE"
        p={[0.3, 2.8, -0.6]}
        width={4.6}
      />
    </group>
  );
}

export function ElectricalDetails() {
  return (
    <group name="electrical-installation-and-testing">
      <AutomationWall />
      <InfrastructureDisplay />
      <CableAndConnectionDisplay />
      <GeneratorDisplay />
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
