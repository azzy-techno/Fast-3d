import { useTexture } from "@react-three/drei";
import { assetUrl } from "../lib/assets";
export function ContactShadow({
  width,
  length,
  height = 0.015,
}: {
  width: number;
  length: number;
  height?: number;
}) {
  const map = useTexture(assetUrl("exterior/optimized/contact.webp"));
  return (
    <mesh
      position={[0, height, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[width, length]} />
      <meshBasicMaterial
        map={map}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}
