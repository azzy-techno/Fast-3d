import type { Point } from "../data/chapters";
import { Vector3 } from "three";
type Key = { at: number; camera: Point; guide: Point; target: Point };
type Exhibit = {
  at: number;
  end: number;
  x: number;
  z: number;
  focus: readonly [number, number, number];
};
export function createExhibitRoute<T extends Exhibit>(
  start: number,
  level: number,
  stations: readonly T[],
) {
  function stationAt(p: number) {
    if (p < start + 0.035 || p > stations[stations.length - 1].end + 0.018)
      return null;
    for (let i = stations.length - 1; i >= 0; i--)
      if (p >= stations[i].at - 0.01) return stations[i];
    return stations[0];
  }
  const keys: Key[] = [];
  function key(at: number, camera: Point, guide: Point, target?: Point) {
    keys.push({
      at,
      camera: [camera[0], level + camera[1], camera[2]],
      guide: [guide[0], level, guide[2]],
      target: target
        ? [target[0], level + target[1], target[2]]
        : [guide[0], level + 1.4, guide[2]],
    });
  }
  key(start - 0.06, [0, 1.7, -1], [-2.1, 0, -1.95]);
  key(start - 0.04, [0, 1.7, -1], [-2.8, 0, 1.3]);
  key(start - 0.02, [0, 1.7, -1], [-2.8, 0, 1.3]);
  // Approach 01 along the entrance aisle and its outside edge. The former
  // central-aisle approach passed 02 before doubling back to the first display.
  key(start, [0, 2.05, -3], [-2.8, 0, 1.3], [0, 2.3, 3.8]);
  key(start + 0.014, [-18, 2.2, 1], [-24, 0, 3]);
  key(start + 0.024, [-27, 2.2, 3], [-29, 0, 3]);
  key(start + 0.035, [-27, 2.2, 16], [-29, 0, 11.8]);
  for (const [i, s] of stations.entries()) {
    const camera: Point = [s.x + 3.8, 2.2, s.z + 8];
    const guide: Point = [s.x + 3.2, 0, s.z + 3.8];
    const target: Point = [s.x + 1.2, 1.45, s.z + 0.5];
    key(s.at, camera, guide, target);
    key(s.end, camera, guide, target);
    if (stations[i + 1] && stations[i + 1].z !== s.z) {
      const side = Math.sign(s.x);
      key(s.end + 0.007, [side * 27, 2.2, s.z + 8], [side * 29, 0, s.z + 3.8]);
      key(
        s.end + 0.023,
        [side * 27, 2.2, s.z + 20],
        [side * 29, 0, s.z + 15.8],
      );
    }
  }
  key(start + 0.75, [-17.2, 2.2, 51], [-22.15, 0, 52], [-21, 2.2, 56.2]);
  key(start + 0.8, [-21, 1.7, 51.9], [-22.15, 0, 54], [-21, 1.7, 58]);
  key(start + 0.84, [-21, 1.7, 51.9], [-22.15, 0, 54], [-21, 1.7, 58]);

  function camera(p: number, position: Vector3, target: Vector3) {
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].at) i++;
    const a = keys[i],
      b = keys[i + 1];
    const t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at)));
    const u = t * t * (3 - 2 * t);
    for (let axis = 0; axis < 3; axis++) {
      position.setComponent(
        axis,
        a.camera[axis] + (b.camera[axis] - a.camera[axis]) * u,
      );
      target.setComponent(
        axis,
        a.target[axis] + (b.target[axis] - a.target[axis]) * u,
      );
    }
  }
  function guide(p: number, position: Vector3, facing: Vector3) {
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].at) i++;
    const a = keys[i],
      b = keys[i + 1];
    const t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))),
      u = t * t * (3 - 2 * t);
    position.set(
      a.guide[0] + (b.guide[0] - a.guide[0]) * u,
      level,
      a.guide[2] + (b.guide[2] - a.guide[2]) * u,
    );
    const s = stationAt(p);
    facing.set(
      s ? s.x + s.focus[0] : b.guide[0],
      level + (s ? s.focus[1] : 1.55),
      s ? s.z + s.focus[2] : b.guide[2],
    );
  }

  return {
    keys: keys.filter((k) => k.at >= start),
    camera,
    guide,
    stationAt,
    presenting: (p: number) => stations.some((s) => p >= s.at && p <= s.end),
  };
}
