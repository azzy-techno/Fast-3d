import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Group, InstancedMesh, Matrix4, Mesh, type Material } from "three";

/** Collapse repeated static primitives after transforms resolve. Animated subtrees
 * opt out with userData.dynamic; materials/geometries remain shared and owned
 * by their original components. Hidden service rooms stay mounted. */
export function StaticInstances({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    const group = root.current!;
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
      const key = `${object.geometry.uuid}/${(object.material as Material).uuid}`;
      const bucket = buckets.get(key) || [];
      bucket.push(object);
      buckets.set(key, bucket);
    });
    const inverse = group.matrixWorld.clone().invert(),
      matrix = new Matrix4();
    const merged: InstancedMesh[] = [],
      originals: Mesh[] = [];
    for (const bucket of buckets.values()) {
      if (bucket.length < 3) continue;
      const instance = new InstancedMesh(
        bucket[0].geometry,
        bucket[0].material,
        bucket.length,
      );
      instance.castShadow = bucket[0].castShadow;
      instance.receiveShadow = bucket[0].receiveShadow;
      bucket.forEach((mesh, i) => {
        matrix.multiplyMatrices(inverse, mesh.matrixWorld);
        instance.setMatrixAt(i, matrix);
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
    };
  }, []);
  return <group ref={root}>{children}</group>;
}
