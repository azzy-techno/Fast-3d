import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const dir = await mkdtemp("/tmp/fast-lift-");
try {
  await build({
    stdin: {
      contents:
        'export * from "./src/scene/compileVisible";export * from "three";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: dir + "/test.mjs",
  });
  const {
    Scene,
    Group,
    Mesh,
    BoxGeometry,
    MeshStandardMaterial,
    PointLight,
    PerspectiveCamera,
    compileVisible,
  } = await import(pathToFileURL(dir + "/test.mjs"));
  const scene = new Scene(),
    hiddenFloor = new Group(),
    visibleFloor = new Group();
  const geometry = new BoxGeometry(),
    material = new MeshStandardMaterial();
  const hiddenMesh = new Mesh(geometry, material),
    visibleMesh = new Mesh(geometry, material),
    batchedOriginal = new Mesh(geometry, material),
    light = new PointLight();
  hiddenFloor.visible = false;
  batchedOriginal.visible = false;
  hiddenFloor.add(hiddenMesh);
  visibleFloor.add(visibleMesh, batchedOriginal, light);
  scene.add(hiddenFloor, visibleFloor);
  let compiled = [];
  await compileVisible(
    {
      compileAsync: async (root, camera, target) => {
        assert.equal(target, scene, "Keep actual scene lighting/environment");
        root.traverse((o) => {
          if (o.isMesh) compiled.push(o);
        });
        const duplicateLights = [];
        root.traverseVisible((o) => {
          if (o.isLight) duplicateLights.push(o);
        });
        assert.equal(
          duplicateLights.length,
          0,
          "Do not count destination lights twice",
        );
      },
    },
    scene,
    new PerspectiveCamera(),
  );
  assert.deepEqual(
    compiled,
    [visibleMesh],
    "Compile only visible meshes, excluding hidden floors and batched originals",
  );
  assert.equal(visibleMesh.parent, visibleFloor);
  assert.equal(hiddenMesh.parent, hiddenFloor);
  assert.equal(hiddenFloor.visible, false);
  assert.equal(batchedOriginal.visible, false);
  console.log(
    "PASS destination shader warm-up excludes hidden geometry and preserves scene graph and lighting",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
