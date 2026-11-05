import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Material,
} from "three";

/** Collapse repeated static primitives after transforms resolve. Animated subtrees
 * opt out with userData.dynamic; materials/geometries remain shared and owned
 * by their original components. Hidden service rooms stay mounted. */
export function batchStatic(group: Group) {
  group.updateWorldMatrix(true, true);
  const buckets = new Map<string, Mesh[]>();
  group.traverse((object) => {
    if (
      !(object instanceof Mesh) ||
      object instanceof InstancedMesh ||
      Array.isArray(object.material) ||
      !object.visible
    )
      return;
    let parent = object.parent;
    while (parent && parent !== group) {
      if (parent.userData.dynamic) return;
      parent = parent.parent;
    }
    const mat = object.material as MeshStandardMaterial;
    // Plain painted primitives share a white material and carry their exact
    // original tint per instance. Textures and emissive surfaces stay separate.
    const surface = mat.userData.fastPrimitive
      ? `paint/${mat.metalness}/${mat.roughness}`
      : mat.uuid;
    const key = `${object.geometry.uuid}/${surface}/${object.castShadow}/${object.receiveShadow}`;
    const bucket = buckets.get(key) || [];
    bucket.push(object);
    buckets.set(key, bucket);
  });
  const inverse = group.matrixWorld.clone().invert(),
    matrix = new Matrix4();
  const merged: InstancedMesh[] = [],
    originals: Mesh[] = [],
    owned: Material[] = [];
  for (const bucket of buckets.values()) {
    if (bucket.length < 2) continue;
    const source = bucket[0].material as MeshStandardMaterial;
    const material = source.userData.fastPrimitive ? source.clone() : source;
    if (material !== source) {
      material.color.set("white");
      owned.push(material);
    }
    const instance = new InstancedMesh(
      bucket[0].geometry,
      material,
      bucket.length,
    );
    instance.castShadow = bucket[0].castShadow;
    instance.receiveShadow = bucket[0].receiveShadow;
    bucket.forEach((mesh, i) => {
      matrix.multiplyMatrices(inverse, mesh.matrixWorld);
      instance.setMatrixAt(i, matrix);
      if (material !== source)
        instance.setColorAt(i, (mesh.material as MeshStandardMaterial).color);
      mesh.visible = false;
      originals.push(mesh);
    });
    instance.computeBoundingSphere();
    group.add(instance);
    merged.push(instance);
  }
  return () => {
    originals.forEach((mesh) => {
      mesh.visible = true;
    });
    merged.forEach((mesh) => {
      group.remove(mesh);
      mesh.dispose();
    });
    owned.forEach((material) => material.dispose());
  };
}
export function StaticInstances({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null);
  useLayoutEffect(() => batchStatic(root.current!), []);
  return <group ref={root}>{children}</group>;
}
