import { build } from "esbuild";
import assert from "node:assert/strict";
const result = await build({
  entryPoints: ["src/scene/travelMotion.ts"],
  bundle: true,
  write: false,
  format: "esm",
});
const { liftDoorOpen, trafficPosition } = await import(
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
        Math.abs(x) > 499 && Math.abs(previous) > 499,
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
