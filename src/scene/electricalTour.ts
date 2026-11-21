import type { Point } from "../data/chapters";
import { electricalScope } from "../data/electrical";
import { Vector3 } from "three";

export const ELECTRICAL_Y = 66;
export const ELECTRICAL_END = 2.84;
export const ELECTRICAL_EXIT = { x: -21, z: 58, cut: 2.91 };
// Two authored floor layouts meet inside a sealed, identically dressed cabin.
// Camera, guide and cabin change coordinate space together, never in the hall.
export function inElectricalRearLift(p: number) {
  return p >= ELECTRICAL_END && p < ELECTRICAL_EXIT.cut;
}
export function toElectricalRear(v: Vector3) {
  v.x = ELECTRICAL_EXIT.x - v.x;
  v.z = ELECTRICAL_EXIT.z - (v.z + 7);
  return v;
}
// Suspended in front of the apparatus so the visitor sees the full name and hardware.
export const electricalSign = {
  x: 1.5,
  y: 3.98,
  z: 2.25,
  yaw: 0.3,
  width: 4.1,
  height: 0.76,
};

// Local equipment surfaces, including the 0.16 m presentation plinth.
const equipment = [
  ["Draw-out LV switchboard", "لوحة قوى بقاطع قابل للسحب", [-0.65, 1.84, 0.74]],
  ["Ring main unit", "وحدة الربط الحلقي", [-0.55, 1.91, 0.65]],
  [
    "Relay injection test set",
    "جهاز الحقن لاختبار المرحلات",
    [0.99, 1.47, 0.91],
  ],
  ["Distribution transformer", "محول توزيع", [0, 2.39, 0.28]],
  [
    "MV terminations & cable cutaway",
    "نهايات كابلات الجهد المتوسط ومقطع الكابل",
    [0, 1.5, 0.49],
  ],
  [
    "Cable drum & laying rollers",
    "بكرة كابل وبكرات مدّ الكابلات",
    [-1.53, 1.38, 0.23],
  ],
  ["DIN-rail distribution board", "لوحة توزيع بقواطع معيارية", [0, 1.53, 0.48]],
  ["Feeder pillar & fuse ways", "خزانة تغذية ومخارج مصهرة", [-1.08, 1.8, 0.42]],
  ["Enclosed generator & DB", "مولد مغلّف ولوحة توزيع", [-0.2, 1.7, 0.84]],
  ["Thermal inspection kit", "عدة الفحص الحراري", [1.07, 1.92, 0.54]],
  ["Automatic capacitor bank", "مجموعة مكثفات آلية", [0.72, 2.13, 0.74]],
  [
    "Smart meters & current transformers",
    "عدادات ذكية ومحولات تيار",
    [0, 2.16, 0.19],
  ],
  [
    "PLC & loop commissioning bench",
    "منضدة اختبار المتحكم وحلقات الإشارة",
    [1.64, 1.7, 0.26],
  ],
  [
    "LED high-bay luminaires",
    "وحدات إنارة LED للأسقف العالية",
    [1.18, 3.2, 0.45],
  ],
  [
    "Linear & street luminaires",
    "وحدات إنارة خطية وإنارة شوارع",
    [-1.52, 2.53, 0.56],
  ],
  ["Ducted axial fan", "مروحة محورية أنبوبية", [0, 1.81, 0.61]],
] as const satisfies ReadonlyArray<
  readonly [string, string, readonly [number, number, number]]
>;
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
      component: equipment[i][0],
      componentAr: equipment[i][1],
      focus: equipment[i][2],
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
key(1.96, [0, 1.7, -1], [-2.8, 0, 1.3]);
key(1.98, [0, 1.7, -1], [-2.8, 0, 1.3]);
// Approach 01 along the entrance aisle and its outside edge. The former
// central-aisle approach passed 02 before doubling back to the first display.
key(2, [0, 2.05, -3], [-2.8, 0, 1.3], [0, 2.3, 3.8]);
key(2.014, [-18, 2.2, 1], [-24, 0, 3]);
key(2.024, [-27, 2.2, 3], [-29, 0, 3]);
key(2.035, [-27, 2.2, 16], [-29, 0, 11.8]);
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
key(2.75, [-17.2, 2.2, 51], [-22.15, 0, 52], [-21, 2.2, 56.2]);
key(2.8, [-21, 1.7, 51.9], [-22.15, 0, 54], [-21, 1.7, 58]);
key(ELECTRICAL_END, [-21, 1.7, 51.9], [-22.15, 0, 54], [-21, 1.7, 58]);
export const electricalCameraKeys = keys.filter((k) => k.at >= 2);
export function sampleElectricalCamera(
  p: number,
  position: Vector3,
  target: Vector3,
) {
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
