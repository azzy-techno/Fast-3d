import type { Point } from "../data/chapters";
import { electricalScope } from "../data/electrical";
import { Vector3 } from "three";

export const ELECTRICAL_Y = 66;
export const ELECTRICAL_END = 2.84;
// Local equipment surfaces, including the 0.16 m presentation plinth.
const focusPoints: Point[] = [
  [0, 2.71, 0.56],
  [0, 1.87, 0.6],
  [-2, 2.71, -0.14],
  [0, 1.76, 1],
  [0, 1.26, 0],
  [-1.5, 1.21, 0],
  [0, 1.31, 0.56],
  [-1.4, 2.71, 0.56],
  [0.5, 1.71, 0.93],
  [-2, 1.6, -0.12],
  [1, 1.66, 0.5],
  [0, 2.51, 0.45],
  [0.2, 1.2, 1.16],
  [0, 3.76, 0],
  [0.65, 4.46, 0],
  [0, 2.06, 0.55],
];
export const electricalStations = electricalScope
  .flatMap((group) =>
    group.items.map(([title, ar], i) => ({
      title,
      ar,
      category: group.title,
      categoryAr: group.ar,
      number: group.start + i,
    })),
  )
  .map((item, i) => {
    const row = Math.floor(i / 4),
      col = row % 2 ? 3 - (i % 4) : i % 4;
    return {
      ...item,
      x: [-21, -7, 7, 21][col],
      z: 8 + row * 12,
      at: 2.045 + i * 0.044,
      end: 2.057 + i * 0.044,
      focus: focusPoints[i],
    };
  });
export function electricalStationAt(p: number) {
  if (p < 2.035 || p > 2.735) return null;
  for (let i = electricalStations.length - 1; i >= 0; i--)
    if (p >= electricalStations[i].at - 0.01) return electricalStations[i];
  return electricalStations[0];
}
export function electricalPresenting(p: number) {
  return electricalStations.some((s) => p >= s.at && p <= s.end);
}
/** Preserve the existing lift choreography, after the full exhibition tour. */
export function electricalDepartureAt(p: number) {
  return 2.84 + ((p - 2.46) * 0.16) / 0.54;
}
export function electricalLiftProgress(p: number) {
  return p >= 2 && p < 3
    ? p < 2.84
      ? 2
      : 2.46 + ((p - 2.84) * 0.54) / 0.16
    : p;
}
type Key = { at: number; camera: Point; guide: Point; target: Point };
const keys: Key[] = [];
function key(at: number, camera: Point, guide: Point, target?: Point) {
  keys.push({
    at,
    camera: [camera[0], ELECTRICAL_Y + camera[1], camera[2]],
    guide: [guide[0], ELECTRICAL_Y, guide[2]],
    target: target
      ? [target[0], ELECTRICAL_Y + target[1], target[2]]
      : [guide[0], ELECTRICAL_Y + 1.4, guide[2]],
  });
}
key(1.94, [0, 1.7, -1], [-2.1, 0, -1.95]);
key(1.96, [0, 1.7, -1], [-2.1, 0, 3]);
key(1.98, [0, 1.7, -1], [2, 0, 3]);
key(2, [0, 2.05, -0.9], [2, 0, 3]);
key(2.015, [0, 2.2, 9], [2, 0, 12]);
key(2.026, [0, 2.2, 16], [-17.8, 0, 12]);
for (const [i, s] of electricalStations.entries()) {
  const camera: Point = [s.x + 3.8, 2.2, s.z + 8];
  const guide: Point = [s.x + 3.2, 0, s.z + 3.8];
  const target: Point = [s.x + 1.2, 1.45, s.z + 0.5];
  key(s.at, camera, guide, target);
  key(s.end, camera, guide, target);
  if (i % 4 === 3 && i < 15) {
    const side = i === 7 ? -1 : 1;
    key(s.end + 0.007, [side * 27, 2.2, s.z + 8], [side * 29, 0, s.z + 3.8]);
    key(s.end + 0.023, [side * 27, 2.2, s.z + 20], [side * 29, 0, s.z + 15.8]);
  }
}
key(2.74, [-27, 2.2, 52], [-29, 0, 47.8]);
key(2.795, [-27, 2.2, -0.9], [-29, 0, -3]);
key(2.825, [0, 1.7, -0.9], [1.15, 0, -3]);
key(ELECTRICAL_END, [0, 1.7, -0.9], [1.15, 0, -3]);
export const electricalCameraKeys = keys.filter((k) => k.at >= 2);
export function sampleElectricalGuide(
  p: number,
  position: Vector3,
  facing: Vector3,
) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].at) i++;
  const a = keys[i],
    b = keys[i + 1];
  const t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))),
    u = t * t * (3 - 2 * t);
  position.set(
    a.guide[0] + (b.guide[0] - a.guide[0]) * u,
    ELECTRICAL_Y,
    a.guide[2] + (b.guide[2] - a.guide[2]) * u,
  );
  const s = electricalStationAt(p);
  facing.set(
    s ? s.x + s.focus[0] : b.guide[0],
    ELECTRICAL_Y + (s ? s.focus[1] : 1.55),
    s ? s.z + s.focus[2] : b.guide[2],
  );
}
