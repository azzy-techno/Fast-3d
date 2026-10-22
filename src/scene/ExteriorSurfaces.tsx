import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  Euler,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { assetUrl } from "../lib/assets";
import type { Point } from "../data/chapters";

export type Surface = {
  p: Point;
  size: [number, number];
  rotation?: Point;
  repeat?: [number, number];
  offset?: [number, number];
};

/** Bake world-scale UVs into merged planes: one draw call per facade style,
 * with no shared texture-repeat mutations between different sized buildings. */
export function ExteriorSurfaces({
  texture,
  surfaces,
  glass = false,
  color = "white",
}: {
  texture: string;
  surfaces: Surface[];
  glass?: boolean;
  color?: string;
}) {
  const source = useTexture(assetUrl(`exterior/optimized/${texture}.webp`));
  const gl = useThree((state) => state.gl);
  const map = useMemo(() => {
    const map = source.clone();
    map.colorSpace = SRGBColorSpace;
    map.wrapS = map.wrapT = RepeatWrapping;
    map.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    map.needsUpdate = true;
    return map;
  }, [source, gl]);
  const geometry = useMemo(() => {
    const planes = surfaces.map(
      ({ p, size, rotation = [0, 0, 0], repeat = [1, 1], offset = [0, 0] }) => {
        const plane = new PlaneGeometry(...size);
        const uv = plane.attributes.uv;
        for (let i = 0; i < uv.count; i++)
          uv.setXY(
            i,
            uv.getX(i) * repeat[0] + offset[0],
            uv.getY(i) * repeat[1] + offset[1],
          );
        plane.applyMatrix4(
          new Matrix4().compose(
            new Vector3(...p),
            new Quaternion().setFromEuler(new Euler(...rotation)),
            new Vector3(1, 1, 1),
          ),
        );
        return plane;
      },
    );
    const merged = mergeGeometries(planes);
    planes.forEach((plane) => plane.dispose());
    merged.computeBoundingSphere();
    return merged;
  }, [surfaces]);
  useEffect(() => () => map.dispose(), [map]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow name={`surface-${texture}`}>
      <meshPhysicalMaterial
        map={map}
        color={color}
        metalness={glass ? 0.25 : 0.02}
        roughness={glass ? 0.28 : 0.88}
        clearcoat={glass ? 0.5 : 0}
        clearcoatRoughness={0.18}
        envMapIntensity={glass ? 0.65 : 0.3}
      />
    </mesh>
  );
}

export function groundSurface(
  p: Point,
  size: [number, number],
  tileSize = 4,
): Surface {
  return {
    p,
    size,
    rotation: [-Math.PI / 2, 0, 0],
    repeat: [size[0] / tileSize, size[1] / tileSize],
  };
}
