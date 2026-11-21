import { createExhibitRoute } from "./exhibitRoute";
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
export const {
  keys: electricalCameraKeys,
  camera: sampleElectricalCamera,
  guide: sampleElectricalGuide,
  stationAt: electricalStationAt,
  presenting: electricalPresenting,
} = createExhibitRoute(2, ELECTRICAL_Y, electricalStations);
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
