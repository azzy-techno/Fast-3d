import { build } from "esbuild";
import assert from "node:assert/strict";
const result = await build({
  stdin: {
    contents:
      'export * from "./src/scene/travelMotion.ts"; export { electricalDepartureAt } from "./src/scene/electricalTour.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const {
  electricalDepartureAt,
  liftDoorOpen,
  trafficPosition,
  stackDoorOpen,
  stackLiftFloor,
} = await import(
  "data:text/javascript;base64," +
    Buffer.from(result.outputFiles[0].text).toString("base64")
);
for (const [kind, a, b] of [
  ["roof", 1.37, 1.48],
  ["service", 1.82, 1.9],
  ["exit", 11.53, 11.58],
]) {
  for (let i = 0; i <= 100; i++)
    assert.equal(
      liftDoorOpen(a + ((b - a) * i) / 100, kind),
      0,
      `${kind} enclosure sealed throughout descent`,
    );
  for (let p = 0; p < 12; p += 0.0001) {
    const x = liftDoorOpen(p, kind);
    assert(x >= 0 && x <= 1);
    assert(
      Math.abs(x - liftDoorOpen(p + 0.0001, kind)) < 0.008,
      "No door position jumps",
    );
  }
}
for (let index = 0; index < 14; index++) {
  let previous = trafficPosition(0, index);
  for (let t = 0.1; t < 1000; t += 0.1) {
    const x = trafficPosition(t, index),
      d = x - previous;
    if (Math.abs(d) > 1)
      assert(
        Math.abs(x) > 999 && Math.abs(previous) > 999,
        "Cars wrap beyond visible horizon",
      );
    else
      assert(
        Math.abs(d - (index % 2 === 0 ? 0.3 : -0.3)) < 0.00001,
        "Constant speed in visible street",
      );
    previous = x;
  }
}
console.log(
  "PASS: sealed lift travel, continuous doors, constant traffic speed, wraps outside visible horizon",
);

for (let chapter = 2; chapter < 11; chapter++) {
  const at = (p) => (chapter === 2 ? electricalDepartureAt(p) : p);
  const from = 66 - (chapter - 2) * 6,
    to = from - 6;
  assert.equal(stackLiftFloor(at(chapter + 0.6)), from);
  assert(Math.abs(stackLiftFloor(at(chapter + 0.76)) - to) < 1e-8);
  for (let k = 1; k < 100; k++)
    assert.equal(
      stackDoorOpen(at(chapter + 0.6 + (0.16 * k) / 100)),
      0,
      "Stacked lift sealed during travel",
    );
}
console.log(
  "PASS: all nine inter-floor descents reach the correct levels with closed doors",
);
