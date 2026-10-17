import { useTexture } from "@react-three/drei";
import { assetUrl } from "../lib/assets";
import { Box, Cylinder } from "./Primitives";
import { Cooling } from "./Equipment";
import { useSurface } from "./Exterior";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

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
      <Box p={[0, 10.8, -1]} s={[32, 21.6, 19]} c="#264557" metal={0.6} />
      <mesh position={[0, 10.9, 8.56]} castShadow receiveShadow>
        <boxGeometry args={[31.5, 19.9, 0.1]} />
        <meshPhysicalMaterial
          color="#63868f"
          metalness={0.88}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh position={[16.06, 10.9, -1]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 19.9, 19]} />
        <meshPhysicalMaterial
          color="#6a8287"
          metalness={0.88}
          roughness={0.13}
          clearcoat={1}
          envMapIntensity={1.4}
        />
      </mesh>
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
      <mesh position={[-11, 11.1, 9.3]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 22.3, 1.5]} />
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
      {/* Paved arrival court, reflective water and a shaded pedestrian entrance. */}
      <mesh
        position={[3, 0.07, 19.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[28, 7]} />
        <meshStandardMaterial
          map={stone}
          color="#d3c9b5"
          bumpMap={stone}
          bumpScale={0.03}
          roughness={0.85}
        />
      </mesh>
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
      {/* Shaded interiors and recessed mullions add depth behind the curtain wall. */}
      {[3.5, 10.5, 17.5].map((y, f) => (
        <group key={y}>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[-8 + i * 1.65, y, 8.69]}>
              <planeGeometry args={[1.4, 2.3]} />
              <meshStandardMaterial
                color={(i + f) % 4 === 0 ? "#b6aa89" : "#304f5d"}
                roughness={0.4}
                metalness={0.45}
                transparent
                opacity={(i + f) % 4 === 0 ? 0.42 : 0.17}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
