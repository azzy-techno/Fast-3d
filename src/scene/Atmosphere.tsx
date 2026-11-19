import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds } from "@react-three/drei";
import { Group, Points } from "three";
import { assetUrl } from "../lib/assets";
import { journeyState } from "./journey";

export function Atmosphere({ mobile }: { mobile: boolean }) {
  const cloudGroup = useRef<Group>(null),
    dust = useRef<Points>(null);
  const motes = useMemo(() => {
    const positions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      const random = (seed: number) => {
        const a = Math.sin(seed * 78.233) * 43758.5453;
        return a - Math.floor(a);
      };
      positions[i * 3] = random(i + 1) * 28 - 14;
      positions[i * 3 + 1] = random(i + 221) * 4 + 76;
      positions[i * 3 + 2] = random(i + 443) * 16 - 8;
    }
    return positions;
  }, []);
  useFrame(({ clock }) => {
    if (cloudGroup.current) {
      cloudGroup.current.visible =
        journeyState.progress < 1.38 || journeyState.progress > 11.72;
      cloudGroup.current.position.x = Math.sin(clock.elapsedTime * 0.008) * 0.6;
    }
    if (dust.current) {
      dust.current.visible =
        journeyState.progress > 1.43 && journeyState.progress < 1.84;
      dust.current.position.y = Math.sin(clock.elapsedTime * 0.05) * 0.1;
    }
  });
  return (
    <>
      <group ref={cloudGroup}>
        <Clouds
          texture={assetUrl("exterior/cloud.png")}
          limit={mobile ? 8 : 16}
        >
          <Cloud
            seed={21}
            position={[-2.8, 88, -1]}
            bounds={[0.4, 1.5, 0.5]}
            segments={mobile ? 4 : 8}
            volume={1.8}
            opacity={0.07}
            color="#eef0e8"
            speed={0.3}
            growth={1.6}
            fade={2}
          />
          <Cloud
            seed={22}
            position={[2.8, 88, -1]}
            bounds={[0.4, 1.5, 0.5]}
            segments={mobile ? 4 : 8}
            volume={1.8}
            opacity={0.06}
            color="#eef0e8"
            speed={0.3}
            growth={1.6}
            fade={2}
          />
        </Clouds>
      </group>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motes, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          color="#fff0ce"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>
    </>
  );
}
