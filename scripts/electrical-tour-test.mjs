import assert from "node:assert/strict";
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
const out = "/tmp/fast-electrical-tour-check.mjs";
await build({
  stdin: {
    contents:
      'export * from "./src/scene/electricalTour"; export * from "./src/scene/journey"; export * from "./src/scene/travelMotion"; export {Vector3,PerspectiveCamera} from "three";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
});
const {
  electricalStations,
  electricalDepartureAt,
  sampleJourney,
  sampleGuide,
  guideIsPresenting,
  stackLiftFloor,
  stackDoorOpen,
  Vector3,
  PerspectiveCamera,
  ELECTRICAL_EXIT,
  toElectricalRear,
} = await import(pathToFileURL(out));
const camera = new Vector3(),
  target = new Vector3(),
  guide = new Vector3(),
  face = new Vector3(),
  old = new Vector3();
let minCamera = Infinity,
  minEquipment = Infinity;
// Entry must use the outside of bay 01, never the central aisle beside 02.
let enteredFirstRow = false;
for (let n = 10000; n <= 10225; n++) {
  const p = n / 5000;
  sampleGuide(p, guide, face);
  sampleJourney(p, camera, target);
  if (p >= 2.014)
    assert(target.x < -15, "Entry camera follows the approach to station 01");
  if (!enteredFirstRow && guide.z >= 5.5) {
    assert(guide.x < -26, "First-row approach must be outside station 01");
    enteredFirstRow = true;
  }
  if (p < electricalStations[0].at) assert(!guideIsPresenting(p));
}
assert(enteredFirstRow, "Entry reaches the first row");
for (const [aspect, extraFov] of [
  [1.44, 0],
  [390 / 844, 20],
]) {
  const view = new PerspectiveCamera(70, aspect, 0.08, 1000);
  for (let n = 10070; n <= 10225; n++) {
    const p = n / 5000;
    view.fov = sampleJourney(p, camera, target) + extraFov;
    view.position.copy(camera);
    view.lookAt(target);
    view.updateMatrixWorld();
    view.updateProjectionMatrix();
    sampleGuide(p, guide, face);
    guide.y += 1;
    guide.project(view);
    assert(
      Math.abs(guide.x) < 0.9 && Math.abs(guide.y) < 0.9,
      `Guide leaves entry framing at ${p}, aspect ${aspect}: ${guide.toArray()}`,
    );
  }
}
for (let n = 9700; n <= 15000; n++) {
  const p = n / 5000;
  sampleJourney(p, camera, target);
  sampleGuide(p, guide, face);
  const distance = Math.hypot(camera.x - guide.x, camera.z - guide.z);
  minCamera = Math.min(minCamera, distance);
  assert(distance > 1, `Guide/camera overlap ${p}: ${distance}`);
  if (p >= 2 && p <= 2.84) {
    assert(
      Math.abs(guide.x) < 30.5 && guide.z < 54.1 && guide.z > -10,
      `Guide exits hall ${p}`,
    );
    assert(
      Math.abs(camera.x) < 30.5 && camera.z < 53.5 && camera.z > -10,
      `Camera exits hall ${p}`,
    );
    for (const s of electricalStations)
      for (const [label, v] of [
        ["camera", camera],
        ["guide", guide],
      ]) {
        const d = Math.hypot(
          Math.max(0, Math.abs(v.x - s.x) - 4.5),
          Math.max(0, Math.abs(v.z - s.z) - 2.5),
        );
        minEquipment = Math.min(minEquipment, d);
        assert(
          d > 0.35,
          `${label} clips station ${s.number} at ${p}: ${v.toArray()}`,
        );
      }
  }
  if (p === ELECTRICAL_EXIT.cut) toElectricalRear(old);
  if (n > 9700)
    assert(camera.distanceTo(old) < 0.8, `Camera discontinuity ${p}`);
  old.copy(camera);
}
sampleJourney(2, camera, target);
assert.equal(target.z, 3.8, "Electrical opens on the introduction poster");
assert(camera.z < 0 && target.x === 0);
let lastExitZ = 47.8;
for (let n = 2718; n <= 2840; n++) {
  sampleGuide(n / 1000, guide, face);
  assert(
    guide.z >= lastExitZ - 1e-7,
    "Electrical exit must not retrace the gallery",
  );
  lastExitZ = guide.z;
}
for (const s of electricalStations) {
  sampleGuide(s.at + 0.001, guide, face);
  const initial = guide.clone();
  sampleGuide(s.end - 0.001, guide, face);
  assert(guide.equals(initial), `Guide does not hold at ${s.number}`);
  assert(guideIsPresenting(s.at + 0.005));
  assert.equal(face.x, s.x + s.focus[0]);
  assert.equal(face.z, s.z + s.focus[2]);
  sampleJourney(s.at + 0.005, camera, target);
  assert(Math.hypot(camera.x - guide.x, camera.z - guide.z) > 3.5);
}
for (let i = 0; i <= 100; i++) {
  const p = electricalDepartureAt(2.6 + (0.16 * i) / 100);
  sampleJourney(p, camera, target);
  assert(Math.abs(camera.y - stackLiftFloor(p) - 1.7) < 1e-7);
  assert(Math.abs(stackDoorOpen(p)) < 1e-7);
}
assert.equal(electricalStations.length, 16);
console.log({
  passed: true,
  stops: 16,
  samples: 5301,
  minCamera,
  minEquipment,
});
