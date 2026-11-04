import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
const dir = await mkdtemp(tmpdir() + "/about-route-");
try {
  await build({
    stdin: {
      contents:
        'export * from "./src/scene/journey.ts";export * from "./src/scene/aboutTour.ts";export * from "./src/lib/journeyScroll.ts";export {Vector3} from "three";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: dir + "/route.mjs",
  });
  const {
    aboutStations,
    sampleJourney,
    sampleGuide,
    guideIsPresenting,
    Vector3,
    scrollAtProgress,
    progressAtScroll,
  } = await import(pathToFileURL(dir + "/route.mjs"));
  assert.equal(aboutStations.length, 33);
  assert.equal(aboutStations.filter((s) => s.panel === "partners").length, 13);
  const camera = new Vector3(),
    target = new Vector3(),
    guide = new Vector3(),
    face = new Vector3(),
    previous = new Vector3(),
    prevGuide = new Vector3();
  let minSeparation = Infinity,
    minDisplay = Infinity,
    maxStep = 0,
    maxGuideStep = 0;
  for (let n = 0; n <= 50000; n++) {
    const p = 1.529 + ((1.742 - 1.529) * n) / 50000;
    sampleJourney(p, camera, target);
    sampleGuide(p, guide, face);
    if (n) {
      maxStep = Math.max(maxStep, camera.distanceTo(previous));
      maxGuideStep = Math.max(maxGuideStep, guide.distanceTo(prevGuide));
    }
    previous.copy(camera);
    prevGuide.copy(guide);
    assert([...camera.toArray(), ...guide.toArray()].every(Number.isFinite));
    if (p >= 1.538 && p <= 1.738) {
      minSeparation = Math.min(
        minSeparation,
        Math.hypot(camera.x - guide.x, camera.z - guide.z),
      );
      for (const person of [camera, guide]) {
        assert(
          Math.abs(person.x) < 32.5 && person.z > -11.5 && person.z < 67.5,
          "Stay within the hall",
        );
        for (const s of aboutStations) {
          const dx = person.x - s.x,
            dz = person.z - s.z;
          const x = dx * Math.cos(s.rotation) - dz * Math.sin(s.rotation),
            z = dx * Math.sin(s.rotation) + dz * Math.cos(s.rotation);
          const dist = Math.hypot(
            Math.max(0, Math.abs(x) - 2.7),
            Math.max(0, -0.3 - z, z - 1.5),
          );
          minDisplay = Math.min(minDisplay, dist);
          assert(
            dist > 0.42,
            `Clear display ${s.number} at ${p}: ${person.toArray()}`,
          );
        }
      }
    }
  }
  assert(maxStep < 0.2, `Camera continuous: ${maxStep}`);
  assert(maxGuideStep < 0.2, `Guide continuous: ${maxGuideStep}`);
  assert(minSeparation > 1, `Guide/camera separation: ${minSeparation}`);
  for (const s of aboutStations) {
    const p = s.at + 0.0009;
    sampleJourney(p, camera, target);
    sampleGuide(p, guide, face);
    assert(guideIsPresenting(p));
    assert(Math.hypot(camera.x - guide.x, camera.z - guide.z) > 4);
    sampleJourney(s.end - 0.0001, previous, prevGuide);
    assert(camera.equals(previous), "Stationary viewing hold");
  }
  const stops = [
    { at: 0, y: 0 },
    { at: 1, y: 2000 },
    { at: 1.53, y: 5000 },
    { at: 1.74, y: 39000 },
    { at: 2, y: 41000 },
    { at: 3, y: 60000 },
  ];
  for (let i = 0; i <= 3000; i++) {
    const p = i / 1000;
    assert(
      Math.abs(progressAtScroll(scrollAtProgress(p, stops), stops) - p) < 1e-10,
      "Scroll mapping round trip",
    );
  }
  console.log({
    passed: true,
    stations: 33,
    samples: 50001,
    minSeparation,
    minDisplay,
    maxStep,
    maxGuideStep,
  });
} finally {
  await rm(dir, { recursive: true, force: true });
}
