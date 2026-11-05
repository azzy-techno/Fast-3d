import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const dir = await mkdtemp("/tmp/fast-render-");
try {
  await build({
    stdin: {
      contents:
        'export {batchStatic} from "./src/scene/StaticInstances";export {sleepHiddenTree} from "./src/scene/useVisibilityUpdates";export * from "three";',
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: dir + "/test.mjs",
  });
  const {
    batchStatic,
    sleepHiddenTree,
    Group,
    Mesh,
    BoxGeometry,
    MeshStandardMaterial,
    InstancedMesh,
    Matrix4,
    Vector3,
    Color,
  } = await import(pathToFileURL(dir + "/test.mjs"));
  const root = new Group(),
    geometry = new BoxGeometry();
  root.position.set(10, 4, -7);
  const make = (color, x) => {
    const material = new MeshStandardMaterial({
      color,
      metalness: 0.25,
      roughness: 0.7,
    });
    material.userData.fastPrimitive = true;
    const mesh = new Mesh(geometry, material);
    mesh.position.x = x;
    root.add(mesh);
    return mesh;
  };
  const a = make("#dc5544", -2),
    b = make("#3388cc", 3);
  const dynamic = new Group();
  dynamic.userData.dynamic = true;
  root.add(dynamic);
  const moving = make("#dc5544", 6);
  dynamic.add(moving);
  const cleanup = batchStatic(root);
  const batch = root.children.find((o) => o instanceof InstancedMesh);
  assert(
    batch && batch.count === 2,
    "Different paint colors collapse into a single draw",
  );
  assert.equal(moving.visible, true, "Animated subtree remains independent");
  const matrix = new Matrix4(),
    position = new Vector3(),
    color = new Color();
  for (const [i, mesh] of [a, b].entries()) {
    batch.getMatrixAt(i, matrix);
    position.setFromMatrixPosition(matrix);
    assert(
      position.distanceTo(mesh.position) < 1e-6,
      "Local placement survives translated parent",
    );
    batch.getColorAt(i, color);
    assert(
      color.distanceTo
        ? color.distanceTo(mesh.material.color) < 1e-6
        : Math.abs(color.r - mesh.material.color.r) < 1e-6 &&
            Math.abs(color.g - mesh.material.color.g) < 1e-6 &&
            Math.abs(color.b - mesh.material.color.b) < 1e-6,
      "Original tint preserved",
    );
  }
  cleanup();
  assert(a.visible && b.visible);
  assert(!root.children.includes(batch));
  const hidden = new Group(),
    child = new Group();
  hidden.add(child);
  let updates = 0;
  const original = child.updateMatrixWorld;
  child.updateMatrixWorld = function (force) {
    updates++;
    original.call(this, force);
  };
  const restore = sleepHiddenTree(hidden);
  hidden.visible = false;
  hidden.position.x = 5;
  child.position.z = 3;
  hidden.updateMatrixWorld(true);
  assert.equal(updates, 0, "Hidden descendants do no matrix work");
  hidden.visible = true;
  hidden.updateMatrixWorld();
  position.setFromMatrixPosition(child.matrixWorld);
  assert.deepEqual(
    position.toArray(),
    [5, 0, 3],
    "First visible frame catches up all transforms",
  );
  restore();
  console.log(
    "PASS batching preserves transforms, paint colors and animation; hidden-tree sleep wakes without stale matrices",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
