import { useTexture } from "@react-three/drei";
import { assetUrl } from "../lib/assets";
import { Box, Cylinder, Pipe } from "./Primitives";
import { Cooling } from "./Equipment";
import type { Point } from "../data/chapters";
function Palm({ p, height = 5 }: { p: Point; height?: number }) {
  return (
    <group position={p}>
      <Cylinder
        p={[0, height / 2, 0]}
        height={height}
        radius={0.16}
        c="#766957"
        metal={0}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <group
          key={i}
          rotation={[0, (i * Math.PI) / 4, 0]}
          position={[0, height, 0]}
        >
          <mesh
            position={[0.95, 0.12, 0]}
            scale={[1.45, 0.09, 0.28]}
            rotation={[0, 0, -0.3]}
          >
            <sphereGeometry args={[1, 6, 5]} />
            <meshStandardMaterial
              color={i % 2 ? "#4e705e" : "#63856c"}
              roughness={1}
            />
          </mesh>
          <Box
            p={[0.85, 0.08, 0]}
            s={[1.8, 0.05, 0.1]}
            c="#799070"
            r={[0, 0, -0.2]}
          />
        </group>
      ))}
    </group>
  );
}
function Tree({ p }: { p: Point }) {
  return (
    <group position={p}>
      <Cylinder p={[0, 1, 0]} radius={0.12} height={2} c="#726955" />
      <mesh position={[0, 2.5, 0]} scale={[1.15, 1.4, 1.15]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#526f5d" roughness={1} />
      </mesh>
    </group>
  );
}
export function Building() {
  const logo = useTexture(assetUrl("fast-logo.png"));
  return (
    <group>
      <Box p={[0, -0.5, -8]} s={[53, 0.7, 63]} c="#a7a99f" metal={0} />
      <Box p={[0, -0.09, -8]} s={[49, 0.12, 59]} c="#aeb8b5" metal={0} />
      <Box p={[0, 0.05, 5]} s={[36, 0.35, 22]} c="#cad0cb" metal={0} />
      <Box p={[0, 10.8, -1]} s={[32, 21.6, 19]} c="#264557" metal={0.6} />
      <Box p={[0, 10.9, 8.56]} s={[31.5, 19.9, 0.1]} c="#4d7586" metal={0.85} />
      <Box p={[16.06, 10.9, -1]} s={[0.1, 19.9, 19]} c="#486e7f" metal={0.85} />
      {[0, 7, 14, 21.7].map((y) => (
        <group key={y}>
          <Box p={[0, y, 8.9]} s={[33, 0.38, 0.9]} c="#d2d7d2" metal={0.2} />
          <Box p={[16.4, y, -1]} s={[0.7, 0.38, 20]} c="#d2d7d2" metal={0.2} />
          <Box p={[-16.4, y, -1]} s={[0.7, 0.38, 20]} c="#d2d7d2" metal={0.2} />
        </group>
      ))}
      {Array.from({ length: 17 }, (_, i) => (
        <Box
          key={i}
          p={[-16 + i * 2, 10.9, 8.77]}
          s={[0.12, 21.4, 0.25]}
          c="#94a9b0"
        />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <Box
          key={i}
          p={[16.18, 10.9, -10.5 + i * 1.9]}
          s={[0.25, 21.4, 0.12]}
          c="#94a9b0"
        />
      ))}
      {[3.5, 10.5, 17.5].map((y) => (
        <group key={y}>
          <Box p={[0, y, 8.78]} s={[32, 0.09, 0.14]} c="#a9bbc0" />
          <Box p={[16.19, y, -1]} s={[0.13, 0.09, 19]} c="#a9bbc0" />
          <Box p={[0, y - 2.8, 8.82]} s={[31.8, 0.06, 0.05]} c="#e6d9b5" glow />
        </group>
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          p={[-14 + i * 2, 19.2, 8.64]}
          s={[1.3, 3.3, 0.04]}
          c={i % 3 === 0 ? "#718b90" : "#4b6877"}
          metal={0.65}
        />
      ))}
      <Box p={[-11, 11.1, 9.3]} s={[4.8, 22.3, 1.5]} c="#c3c7c0" metal={0.1} />
      {Array.from({ length: 13 }, (_, i) => (
        <Box
          key={i}
          p={[-13.2 + i * 0.35, 11.2, 10.12]}
          s={[0.08, 21.5, 0.2]}
          c="#9d9f95"
          metal={0.1}
        />
      ))}
      <Box p={[0, 22.3, -1]} s={[34, 0.7, 21]} c="#d3d6cd" metal={0.1} />
      <Box p={[0, 22.8, -1]} s={[31.5, 0.3, 18.5]} c="#899b9c" />
      <group position={[0, 23, -1]} scale={0.8}>
        <Cooling />
      </group>
      <Box p={[3, 6.7, 12]} s={[20, 0.45, 7]} c="#d7d9d0" metal={0.1} />
      <Box p={[3, 6.45, 14.9]} s={[19.5, 0.07, 0.1]} c="#eece9a" glow />
      {[-6, 12].map((x) => (
        <Cylinder
          key={x}
          p={[x, 3.3, 14.5]}
          radius={0.2}
          height={6.6}
          c="#b5b9b2"
        />
      ))}
      <Box p={[3, 2.8, 9]} s={[7, 5.5, 0.2]} c="#2b5064" metal={0.8} />
      {[-0.5, 3, 6.5].map((x) => (
        <Box key={x} p={[x, 2.8, 9.15]} s={[0.09, 5.5, 0.1]} c="#bac9ce" />
      ))}
      <Box p={[8, 18.3, 9.1]} s={[10, 3.6, 0.3]} c="#eff0e9" metal={0.05} />
      <mesh position={[8, 18.3, 9.28]}>
        <planeGeometry args={[8, 2.3]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      {/* The industrial hall connects to the commercial building behind the facade. */}
      <Box p={[0, 5.1, -23]} s={[32, 10.2, 25]} c="#879ca3" />
      <Box p={[0, 10.4, -23]} s={[33, 0.6, 26]} c="#b1bcb9" />
      {[-14, -10, -6, -2, 2, 6, 10, 14].map((x) => (
        <Box key={x} p={[x, 10.75, -23]} s={[0.12, 0.12, 25]} c="#758d98" />
      ))}
      {[-29, -22, -15].map((z) => (
        <group key={z}>
          <Box p={[16.1, 3, z]} s={[0.2, 5.7, 5.4]} c="#4d687a" />
          {Array.from({ length: 8 }, (_, i) => (
            <Box
              key={i}
              p={[16.25, 0.5 + i * 0.68, z]}
              s={[0.1, 0.04, 5.3]}
              c="#8fa2a9"
            />
          ))}
        </group>
      ))}
      {[-11, 0, 11].map((x) => (
        <Box
          key={x}
          p={[x, 10.8, -23]}
          s={[3, 0.3, 20]}
          c="#38637c"
          metal={0.8}
        />
      ))}
      {/* Arrival court, water and Saudi landscaping. */}
      <Box p={[3, 0.05, 20]} s={[27, 0.1, 7]} c="#9ba8a7" metal={0} />
      <Box p={[-14, 0.4, 19]} s={[9, 0.6, 5]} c="#c4c8c0" metal={0} />
      <Box p={[-14, 0.72, 19]} s={[8.4, 0.04, 4.4]} c="#3b9eb2" metal={0.75} />
      <Box p={[0, -0.06, 27]} s={[90, 0.08, 8]} c="#364c58" metal={0} />
      <Box p={[30, -0.06, -9]} s={[8, 0.08, 65]} c="#364c58" metal={0} />
      {Array.from({ length: 12 }, (_, i) => (
        <Box
          key={i}
          p={[-40 + i * 7, 0, 27]}
          s={[3, 0.015, 0.15]}
          c="#a9b8b6"
        />
      ))}
      {[-23, -18, -3, 13, 23].map((x, i) => (
        <Palm key={x} p={[x, 0.1, i % 2 ? 19 : 22]} height={i % 2 ? 5 : 6} />
      ))}
      {[-18, -10, -2, 6, 14].map((z) => (
        <group key={z}>
          <Box p={[-22, 0.25, z]} s={[4, 0.5, 5.5]} c="#7e927d" metal={0} />
          <Tree p={[-22, 0.5, z]} />
          <Palm p={[23, 0.1, z]} height={5} />
        </group>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[22, 0, -25 + i * 5]}>
          <Box p={[0, 0.03, 0]} s={[5, 0.02, 0.08]} c="#b7c3be" />
          <Box
            p={[0, 0.65, 1.8]}
            s={[3.8, 1.2, 1.8]}
            c={i % 2 ? "#d0d5cd" : "#3b5b6f"}
          />
          <Box p={[0, 1.3, 1.8]} s={[2, 0.6, 1.65]} c="#547385" />
        </group>
      ))}
      {[-9, 9].map((x) => (
        <Pipe
          key={x}
          a={[x, 0.1, 23]}
          b={[x, 3.4, 23]}
          radius={0.07}
          c="#354e5e"
        />
      ))}
    </group>
  );
}
