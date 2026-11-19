import { useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import {
  BufferAttribute,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { assetUrl } from "../lib/assets";

/** Four continuous slabs surround the shaft. The finish repeats in metres and the
 * daylight bake spans the room, so grout and shadows line up across the joins. */
export function InteriorFloor({ office = false }: { office?: boolean }) {
  const [stone, daylight] = useTexture([
    assetUrl("architecture/terrazzo.webp"),
    assetUrl("architecture/gallery-daylight.webp"),
  ]);
  const map = useMemo(() => {
    const texture = stone.clone();
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }, [stone]);
  daylight.channel = 1;
  const geometry = useMemo(() => {
    const halfWidth = office ? 15.5 : 11.5;
    const back = office ? -10.5 : -37.5;
    const front = office ? 8.5 : 1.5;
    const shaftFront = office ? -4.5 : -34.5;
    const bounds = [
      [-halfWidth, -2.5, back, front],
      [2.5, halfWidth, back, front],
      [-2.5, 2.5, shaftFront, front],
    ];
    if (office) bounds.push([-2.5, 2.5, back, -9.5]);
    const parts = bounds.map(([left, right, minZ, maxZ]) => {
      const part = new PlaneGeometry(right - left, maxZ - minZ);
      part.rotateX(-Math.PI / 2);
      part.translate(
        (left + right) / 2,
        office ? 16.025 : 6.025,
        (minZ + maxZ) / 2,
      );
      const position = part.attributes.position;
      const uv1 = new BufferAttribute(new Float32Array(position.count * 2), 2);
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i),
          z = position.getZ(i);
        part.attributes.uv.setXY(i, x / 1.5, z / 1.5);
        uv1.setXY(
          i,
          (x + halfWidth) / (2 * halfWidth),
          (front - z) / (front - back),
        );
      }
      part.setAttribute("uv1", uv1);
      return part;
    });
    const result = mergeGeometries(parts);
    parts.forEach((part) => part.dispose());
    return result;
  }, [office]);
  useEffect(() => () => map.dispose(), [map]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={map}
        aoMap={office ? daylight : null}
        roughness={0.48}
        metalness={0.12}
        envMapIntensity={0.7}
      />
    </mesh>
  );
}
