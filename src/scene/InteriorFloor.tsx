import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Subtle terrazzo grain and thin grout, sampled in world units. */
export function InteriorFloor({ office = false }: { office?: boolean }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const data = context.createImageData(512, 512);
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const i = (y * 512 + x) * 4;
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        const value = 199 + (n - Math.floor(n) - 0.5) * 12;
        const grout = x < 2 || y < 2 ? 0.82 : 1;
        data.data[i] = (value + 8) * grout;
        data.data[i + 1] = (value + 5) * grout;
        data.data[i + 2] = (value - 5) * grout;
        data.data[i + 3] = 255;
      }
    context.putImageData(data, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
  const geometry = useMemo(() => {
    const planes = [];
    const minX = office ? -15.5 : -11.5,
      maxX = office ? 15.5 : 11.5;
    const minZ = office ? -10.5 : -37.5,
      maxZ = office ? 8.5 : 1.5;
    for (let x = minX; x < maxX; x++)
      for (let z = minZ; z < maxZ; z++) {
        if (
          Math.abs(x + 0.5) < 2.5 &&
          (Math.abs(z + 0.5 + 7) < 2.5 || (!office && z < -35))
        )
          continue;
        const plane = new PlaneGeometry(1, 1);
        plane.rotateX(-Math.PI / 2);
        plane.translate(x + 0.5, office ? 16.025 : 6.025, z + 0.5);
        const uv = plane.attributes.uv,
          position = plane.attributes.position;
        for (let i = 0; i < uv.count; i++)
          uv.setXY(i, position.getX(i) / 1.5, position.getZ(i) / 1.5);
        planes.push(plane);
      }
    const geometry = mergeGeometries(planes);
    planes.forEach((plane) => plane.dispose());
    return geometry;
  }, [office]);
  useEffect(
    () => () => {
      map.dispose();
    },
    [map],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={map}
        roughness={0.45}
        metalness={0.12}
        envMapIntensity={0.7}
      />
    </mesh>
  );
}
