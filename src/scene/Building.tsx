import { useTexture } from "@react-three/drei";
import { assetUrl } from "../lib/assets";
import { Box, Cylinder } from "./Primitives";
import { RooftopPlant } from "./RooftopPlant";
import { Cooling } from "./Equipment";
import { useSurface } from "./Exterior";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { ExteriorSurfaces, groundSurface } from "./ExteriorSurfaces";

export function Building() {
  const logo = useTexture(assetUrl("fast-logo.png"));
  const stone = useSurface("stone");
  const ripples = useSurface("water");
  const water = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    ripples.offset.x = Math.sin(clock.elapsedTime * 0.08) * 0.03;
    ripples.offset.y = clock.elapsedTime * 0.006;
  });
  return (
    <group>
      <Box p={[0, -0.5, -8]} s={[53, 0.7, 63]} c="#a7a99f" metal={0} />
      <Box p={[0, -0.09, -8]} s={[49, 0.12, 59]} c="#aeb8b5" metal={0} />
      <Box p={[0, 0.05, 5]} s={[36, 0.35, 22]} c="#cad0cb" metal={0} />
      <Box p={[0, 40.8, -1]} s={[32, 81.6, 19]} c="#264557" metal={0.6} />
      <ExteriorSurfaces
        texture="facade-tower-glass"
        glass
        surfaces={[
          { p: [0, 40.85, 8.56], size: [32, 81.7], repeat: [2, 5.6] },
          {
            p: [16.06, 40.85, -1],
            size: [19, 81.7],
            rotation: [0, Math.PI / 2, 0],
            repeat: [19 / 16, 5.6],
          },
          {
            p: [-16.06, 40.85, -1],
            size: [19, 81.7],
            rotation: [0, -Math.PI / 2, 0],
            repeat: [19 / 16, 5.6],
          },
        ]}
      />
      {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 76, 81.7].map((y) => (
        <group key={y}>
          <Box p={[0, y, 8.9]} s={[33, 0.38, 0.9]} c="#d2d7d2" metal={0.2} />
          <Box p={[16.4, y, -1]} s={[0.7, 0.38, 20]} c="#d2d7d2" metal={0.2} />
          <Box p={[-16.4, y, -1]} s={[0.7, 0.38, 20]} c="#d2d7d2" metal={0.2} />
        </group>
      ))}
      <mesh position={[-11, 41.1, 9.3]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 82.3, 1.5]} />
        <meshStandardMaterial
          color="#e1d0ae"
          map={stone}
          bumpMap={stone}
          bumpScale={0.025}
          roughness={0.85}
        />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <Box
          key={i}
          p={[-13.2 + i * 0.35, 41.2, 10.12]}
          s={[0.08, 81.5, 0.2]}
          c="#9d9f95"
          metal={0.1}
        />
      ))}
      <Box p={[0, 82.3, -1]} s={[34, 0.7, 21]} c="#d3d6cd" metal={0.1} />
      <Box p={[0, 82.8, -1]} s={[31.5, 0.3, 18.5]} c="#899b9c" />
      <RooftopPlant />
      <ExteriorSurfaces
        texture="facade-industrial"
        surfaces={[
          {
            p: [-16.02, 5.1, -23],
            size: [25, 10.2],
            rotation: [0, -Math.PI / 2, 0],
            repeat: [2, 1],
          },
          {
            p: [0, 5.1, -35.52],
            size: [32, 10.2],
            rotation: [0, Math.PI, 0],
            repeat: [3, 1],
          },
        ]}
      />
      <group position={[0, 83, -1]} scale={0.8}>
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
      <Box p={[8, 78.3, 9.1]} s={[10, 3.6, 0.3]} c="#eff0e9" metal={0.05} />
      <mesh position={[8, 78.3, 9.28]}>
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
      {/* Paved arrival court, reflective water and a shaded pedestrian entrance. */}
      <ExteriorSurfaces
        texture="ground-paving-corniche"
        surfaces={[
          groundSurface([3, 0.08, 19.5], [28, 7]),
          groundSurface([21, -0.015, -8], [6, 59]),
          groundSurface([-21, -0.015, -8], [6, 59]),
        ]}
      />
      <ExteriorSurfaces
        texture="ground-grass"
        color="#bec7a0"
        surfaces={[
          groundSurface([-23.5, 0.015, -8], [1, 54], 3),
          groundSurface([23.5, 0.015, -8], [1, 54], 3),
        ]}
      />
      <Box p={[-14, 0.4, 19]} s={[9, 0.6, 5]} c="#c8bdab" metal={0} />
      <mesh
        ref={water}
        position={[-14, 0.73, 19]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[8.4, 4.4]} />
        <meshPhysicalMaterial
          color="#467f83"
          metalness={0.6}
          roughness={0.13}
          clearcoat={1}
          bumpMap={ripples}
          bumpScale={0.045}
          envMapIntensity={1.5}
        />
      </mesh>
      {[-17, -14, -11].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.05, 19]}>
            <cylinderGeometry args={[0.025, 0.04, 0.65, 8]} />
            <meshStandardMaterial
              color="#b2ded9"
              transparent
              opacity={0.65}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[x, 0.755, 19]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.29, 32]} />
            <meshStandardMaterial color="#a4c8c3" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      {[-6, -3, 0, 3, 6, 9, 12].map((x) => (
        <Box
          key={x}
          p={[x, 6.37, 12]}
          s={[0.1, 0.18, 6]}
          c="#ad9774"
          metal={0.1}
        />
      ))}
      {[-7, 13].map((x) => (
        <group key={x}>
          <Box p={[x, 0.35, 16.5]} s={[2, 0.7, 2]} c="#b7b2a3" metal={0} />
          <mesh position={[x, 0.87, 16.5]} scale={[0.8, 0.55, 0.8]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#5b6b42" roughness={1} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Cylinder
          key={i}
          p={[-7 + i * 3, 0.5, 23]}
          height={1}
          radius={0.09}
          c="#51595a"
        />
      ))}
    </group>
  );
}
