import { Vector3 } from "three";
import type { Point } from "../data/chapters";
export const ABOUT_START = 1.53,
  ABOUT_END = 1.74,
  ABOUT_Y = 76;
export const OBSERVATORY_AT = 1.605;
type Key = { at: number; camera: Point; guide: Point; target: Point };
export const aboutRouteKeys: Key[] = [
  {
    at: 1.53,
    camera: [10.2, 77.7, 0.5],
    guide: [9.537699120703023, 76, 1.3677673253017808],
    target: [6.4, 77.2, -5],
  },
  { at: 1.535, camera: [6, 78.2, 6], guide: [4, 76, 11], target: [0, 78, 30] },
  { at: 1.545, camera: [6, 78.2, 6], guide: [4, 76, 11], target: [0, 78, 30] },
  {
    at: 1.565,
    camera: [-4, 78.1, 23],
    guide: [-2, 76, 26],
    target: [0, 77.6, 30],
  },
  {
    at: 1.576,
    camera: [-4, 78.1, 30],
    guide: [1.7, 76, 28],
    target: [0, 77.6, 30],
  },
  {
    at: 1.585,
    camera: [-3, 78, 35],
    guide: [1.3, 76, 31.2],
    target: [0, 77.6, 30],
  },
  {
    at: 1.592,
    camera: [-3, 78, 35],
    guide: [1.3, 76, 31.2],
    target: [0, 77.6, 30],
  },
  {
    at: 1.596,
    camera: [-1.8, 77.9, 34.5],
    guide: [0, 76, 32.4],
    target: [0, 77.65, 29],
  },
  {
    at: 1.599,
    camera: [0, 77.7, 33.5],
    guide: [0, 76, 31],
    target: [0, 77.65, 29],
  },
  {
    at: 1.601,
    camera: [0, 77.7, 33.5],
    guide: [0, 76, 31],
    target: [0, 77.65, 29],
  },
  {
    at: 1.605,
    camera: [0, 77.65, 31.4],
    guide: [0, 76, 31],
    target: [0, 77.65, 28],
  },
  {
    at: 1.65,
    camera: [0, 77.65, 31.4],
    guide: [0, 76, 31],
    target: [0, 77.65, 28],
  },
  {
    at: 1.67,
    camera: [-3, 78, 35],
    guide: [1.3, 76, 31.2],
    target: [0, 77.6, 30],
  },
  {
    at: 1.678,
    camera: [-4, 78.1, 30],
    guide: [1.7, 76, 28],
    target: [0, 78, 6],
  },
  {
    at: 1.687,
    camera: [-4, 78.1, 23],
    guide: [-2, 76, 26],
    target: [0, 78, 6],
  },
  {
    at: 1.718,
    camera: [-4, 78.1, 5],
    guide: [-2, 76, 2],
    target: [0, 77.7, -7],
  },
  {
    at: 1.737,
    camera: [0, 77.7, 2],
    guide: [0.04814814814814815, 76, -0.47022016012967677],
    target: [0, 77.7, -7],
  },
  {
    at: 1.74,
    camera: [0, 77.7, 2],
    guide: [0.04814814814814815, 76, -0.47022016012967677],
    target: [0, 77.7, -7],
  },
];
function sample(p: number, field: "camera" | "guide" | "target", out: Vector3) {
  let i = 0;
  while (i < aboutRouteKeys.length - 2 && p > aboutRouteKeys[i + 1].at) i++;
  const a = aboutRouteKeys[i],
    b = aboutRouteKeys[i + 1],
    t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))),
    u = t * t * (3 - 2 * t);
  for (let k = 0; k < 3; k++)
    out.setComponent(k, a[field][k] + (b[field][k] - a[field][k]) * u);
}
export function sampleAboutCamera(
  p: number,
  position: Vector3,
  target: Vector3,
) {
  sample(p, "camera", position);
  sample(p, "target", target);
}
export function sampleAboutGuide(
  p: number,
  position: Vector3,
  target: Vector3,
) {
  sample(p, "guide", position);
  target.set(0, 77.65, 30);
}
export function aboutPresenting(p: number) {
  return p >= 1.585 && p <= 1.592;
}
