import assert from "node:assert/strict";
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
const dir = await mkdtemp(path.join(os.tmpdir(), "fast-route-"));
try {
  const file = path.join(dir, "route.mjs");
  await build({
    stdin: {
      contents:
        'export * from "./src/scene/journey.ts"; export { electricalDepartureAt } from "./src/scene/electricalTour.ts"; export { stackLiftFloor, stackDoorOpen } from "./src/scene/travelMotion.ts"; export { Vector3 } from "three";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: file,
  });
  const {
    electricalDepartureAt,
    sampleJourney,
    sampleGuide,
    guideIsPresenting,
    serviceRooms,
    stackLiftFloor,
    stackDoorOpen,
    Vector3,
  } = await import(pathToFileURL(file));
  const p = new Vector3(),
    target = new Vector3(),
    previous = new Vector3(),
    reverse = new Vector3(),
    reverseTarget = new Vector3();
  let closest = Infinity,
    maxStep = 0,
    doors = 0;
  for (let n = 0; n <= 12000; n++) {
    const progress = n / 1000;
    sampleJourney(progress, p, target);
    assert([...p.toArray(), ...target.toArray()].every(Number.isFinite));
    closest = Math.min(closest, p.distanceTo(target));
    assert(
      p.distanceTo(target) > 0.5,
      `Degenerate look direction at ${progress}`,
    );
    if (n) {
      maxStep = Math.max(maxStep, p.distanceTo(previous));
      assert(
        p.distanceTo(previous) <
          (progress > 11.89 || (progress >= 2 && progress < 2.84) ? 3 : 1.2),
        `Camera discontinuity at ${progress}`,
      );
    }
    if (progress >= 2.84 && progress <= 11.4) {
      assert(
        p.y > 13.4 && p.y <= 69.01,
        `Camera outside service floor at ${progress}`,
      );
      assert(
        Math.abs(p.x) < (p.z > -0.45 ? 15.3 : 4.1),
        `Camera enters equipment envelope at ${progress}`,
      );
      if (Math.abs(Math.abs(p.x) - 2.32) < 0.05 && p.z < -0.45) {
        const room = serviceRooms.find(
          (room) =>
            Math.sign(p.x) === room.side &&
            Math.abs(p.z - (room.z + 2.5)) < 0.84,
        );
        assert(
          room,
          `Camera crosses solid partition instead of doorway at ${progress}: ${p.toArray()}`,
        );
        doors++;
      }
    }
    sampleJourney(progress, reverse, reverseTarget);
    assert(
      p.equals(reverse) && target.equals(reverseTarget),
      "Sampling must be deterministic",
    );
    previous.copy(p);
  }
  assert(doors > 10);
  for (let chapter = 2; chapter < 11; chapter++)
    for (let n = 0; n <= 100; n++) {
      const raw = chapter + 0.6 + (n * 0.16) / 100;
      const at = chapter === 2 ? electricalDepartureAt(raw) : raw;
      sampleJourney(at, p, target);
      assert(
        Math.abs(p.y - stackLiftFloor(at) - 1.7) < 1e-7,
        "Camera stays inside descending cabin",
      );
      assert(
        stackDoorOpen(at) < 1e-8,
        "Lift stays sealed across the slab opening",
      );
    }

  const host = new Vector3(),
    hostTarget = new Vector3(),
    hostPrevious = new Vector3();
  let worstCameraAt = 0;
  let minCameraClearance = Infinity,
    minExhibitClearance = Infinity;
  let hostMaxStep = 0,
    hostWorstAt = 0;
  for (let n = 0; n <= 12000; n++) {
    sampleGuide(n / 1000, host, hostTarget);
    assert([...host.toArray(), ...hostTarget.toArray()].every(Number.isFinite));
    if (n && host.distanceTo(hostPrevious) > hostMaxStep) {
      hostMaxStep = host.distanceTo(hostPrevious);
      hostWorstAt = n / 1000;
    }
    if (
      n / 1000 >= 2.84 &&
      n / 1000 <= 11.4 &&
      Math.abs(Math.abs(host.x) - 2.32) < 0.05
    ) {
      const room = serviceRooms.find(
        (room) =>
          Math.sign(host.x) === room.side &&
          Math.abs(host.z - (room.z + 2.5)) < 0.84,
      );
      assert(
        room,
        `Guide crosses a solid partition at ${n / 1000}: ${host.toArray()}`,
      );
    }
    if (n / 1000 >= 1.94 && n / 1000 <= 11.43) {
      sampleJourney(n / 1000, p, target);
      const distance = Math.hypot(host.x - p.x, host.z - p.z);
      if (distance < minCameraClearance) worstCameraAt = n / 1000;
      minCameraClearance = Math.min(minCameraClearance, distance);
      for (const room of serviceRooms) {
        if (room.index === 1 || Math.abs(host.y - room.y) > 3) continue;
        const dx = Math.max(0, Math.abs(host.x - room.x) - 3.3);
        const dz = Math.max(0, room.z - 3.15 - host.z, host.z - room.z - 1.65);
        const clearance = Math.hypot(dx, dz);
        minExhibitClearance = Math.min(minExhibitClearance, clearance);
      }
    }
    hostPrevious.copy(host);
  }
  assert(
    hostMaxStep < 3,
    `Guide discontinuity at ${hostWorstAt}: ${hostMaxStep}`,
  );
  console.log({ minCameraClearance, minExhibitClearance, worstCameraAt });
  assert(
    minCameraClearance > 1.0,
    "Guide must not approach or pass through camera",
  );
  assert(
    minExhibitClearance > 0.32,
    "Guide body must clear equipment envelopes",
  );
  assert.equal(
    new Set(serviceRooms.map((r) => r.y)).size,
    10,
    "Every service occupies its own floor",
  );
  for (let chapter = 3; chapter <= 11; chapter++) {
    sampleGuide(chapter, host, hostTarget);
    sampleGuide(chapter + 0.2, reverse, reverseTarget);
    assert(
      host.equals(reverse),
      "Guide must stay in its bay throughout a showcase",
    );
    sampleJourney(chapter, p, target);
    assert.equal(
      p.y,
      serviceRooms[chapter - 2].y + 2.05,
      "Camera reaches the correct service level",
    );
    assert(
      Math.hypot(host.x - p.x, host.z - p.z) > 4,
      "Showcase guide must stay out of the foreground",
    );
    assert(guideIsPresenting(chapter));
    assert(!guideIsPresenting(chapter + 0.6));
  }
  sampleJourney(11.55, p, target);
  assert(p.y < 12 && p.y > 2, "Exit descends in lift");
  sampleJourney(11.69, p, target);
  assert(p.y < 2.1 && p.z > -1, "Reception reached at walking height");
  sampleJourney(11.81, p, target);
  assert(p.z > 9 && p.y < 2.1, "Walk outside before drone ascent");
  sampleGuide(11.86, host, hostTarget);
  assert.equal(host.z, 18, "Host stays on forecourt during farewell");
  sampleGuide(12, host, hostTarget);
  assert.equal(host.y, 0.25, "Host does not fly with drone");
  console.log(
    JSON.stringify(
      {
        passed: true,
        samples: 12001,
        minimumTargetDistance: closest,
        maximumStepAtOneThousandthProgress: maxStep,
        doorwaySamples: doors,
      },
      null,
      2,
    ),
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
