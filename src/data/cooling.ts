import type { Vector3 } from "three";
import type { Point } from "./chapters";

// Local coordinates are metres in the Blender model. The tour runs from 1.12 down to the farewell.
export const towerOrigin: Point = [0, 83, -1.4];
export const towerModules = {
  Frame: { stage: 0, offset: [0, 0, 0] },
  LeftShell: { stage: 1, offset: [-3.2, 0.55, -2.1] },
  RightShell: { stage: 1, offset: [2.7, 0.55, -3.4] },
  FanStack: { stage: 2, offset: [-0.65, 3.1, -0.6] },
  Rotor: { stage: 2, offset: [0.35, 1.65, 0.25] },
  Drive: { stage: 3, offset: [2.8, 0.85, 0.15] },
  Eliminator: { stage: 4, offset: [-3.1, 1.0, 1.1] },
  Distribution: { stage: 5, offset: [0.45, 0.85, 2.25] },
  FillLeft: { stage: 6, offset: [-1.85, 0.35, 2.45] },
  FillRight: { stage: 6, offset: [2.1, 0.35, 1.8] },
  Basin: { stage: 7, offset: [0, 0.08, 3.15] },
} as const;
export type TowerModule = keyof typeof towerModules;
type Stop = {
  at: number;
  part: TowerModule;
  focus: Point;
  title: [string, string];
  service: [string, string];
  note: [string, string];
};
export const coolingStops: Stop[] = [
  {
    at: 1.12,
    part: "Frame",
    focus: [2.25, 4.29, 1.64],
    title: ["The assembled tower", "برج التبريد المجمّع"],
    service: ["Design, supply & installation", "التصميم والتوريد والتركيب"],
    note: [
      "This single induced-draft cell draws air up through falling water. Open it layer by layer to see where FAST inspects, replaces and tests the equipment.",
      "تسحب المروحة الهواء إلى أعلى عبر الماء الهابط في خلية التبريد. افتح البرج طبقةً بعد أخرى لاستكشاف مواضع الفحص والاستبدال والاختبار لدى فاست.",
    ],
  },
  {
    at: 1.07,
    part: "RightShell",
    focus: [2.44, 2.86, 0.72],
    title: ["Casing & intake louvres", "الغلاف وفتحات دخول الهواء"],
    service: ["Inspection & structural restoration", "الفحص وترميم الهيكل"],
    note: [
      "The casing opens along its service seam, exposing the braced frame. FAST inspects for corrosion, strengthens ageing frameworks and evaluates protective coatings.",
      "ينفتح الغلاف عند فاصل الصيانة ليكشف الإطار ودعاماته. تفحص فاست التآكل وتقوّي الهياكل المتقادمة وتقيّم طبقات الحماية.",
    ],
  },
  {
    at: 1.02,
    part: "Rotor",
    focus: [0, 4.77, 0],
    title: ["Fan stack & axial rotor", "فوهة الطرد والمروحة المحورية"],
    service: [
      "Fan inspection & vibration assessment",
      "فحص المراوح وتقييم الاهتزاز",
    ],
    note: [
      "The guard and discharge stack lift clear of the pitched fan blades. FAST checks the fan assembly, evaluates noise and vibration, and replaces deteriorated fans.",
      "ترتفع الشبكة وفوهة الطرد لتظهر ريش المروحة المائلة. تفحص فاست مجموعة المروحة وتقيّم الضوضاء والاهتزاز وتستبدل المراوح المتضررة.",
    ],
  },
  {
    at: 0.97,
    part: "Drive",
    focus: [0.21, 4.08, 0.27],
    title: ["Motor, shaft & gearbox", "المحرك والعمود وعلبة التروس"],
    service: [
      "Mechanical overhaul & preventive maintenance",
      "التأهيل الميكانيكي والصيانة الوقائية",
    ],
    note: [
      "Follow the horizontal motor shaft to the right-angle gearbox beneath the fan. Motor inspection and gearbox replacement are part of FAST’s mechanical service scope.",
      "تتبّع عمود المحرك الأفقي إلى علبة التروس أسفل المروحة. يشمل نطاق فاست الميكانيكي فحص المحرك واستبدال علب التروس.",
    ],
  },
  {
    at: 0.92,
    part: "Eliminator",
    focus: [0, 3.57, 1.5],
    title: ["Drift eliminator cassette", "حزمة مانعات انجراف الرذاذ"],
    service: [
      "Internal replacement & material testing",
      "استبدال المكونات الداخلية واختبار المواد",
    ],
    note: [
      "The folded channels turn the exhaust air so droplets collect on their walls and drain back. FAST inspects and replaces eliminators and tests polymer and composite condition.",
      "تغيّر القنوات المطوية اتجاه الهواء فيترسّب الرذاذ على جدرانها ويعود إلى البرج. تفحص فاست مانعات الانجراف وتستبدلها وتختبر حالة البوليمرات والمواد المركبة.",
    ],
  },
  {
    at: 0.87,
    part: "Distribution",
    focus: [0.57, 2.84, 1.17],
    title: ["Spray header & nozzles", "مجمّع التوزيع وفوهات الرش"],
    service: ["Water-distribution retrofit", "تأهيل نظام توزيع المياه"],
    note: [
      "Branch pipes feed the nozzles above the fill. FAST’s cooling-tower services profile lists replacement of the water-distribution system at SABIC Ar Razi.",
      "تغذّي الأنابيب الفرعية فوهات الرش فوق الحشوة. يورد ملف خدمات فاست استبدال نظام توزيع المياه في أبراج سابك الرازي.",
    ],
  },
  {
    at: 0.82,
    part: "FillRight",
    focus: [1.3, 2.16, 1.46],
    title: ["Corrugated fill packs", "حزم الحشوات المموجة"],
    service: [
      "Fill replacement & thermal performance",
      "استبدال الحشوات وتقييم الأداء الحراري",
    ],
    note: [
      "The packs separate to expose the folded surfaces where water meets air. FAST replaces degraded fill and tests tower performance using CTI ATC-105 guidelines.",
      "تنفصل الحزم لتكشف الأسطح المطوية التي يلتقي عليها الماء بالهواء. تستبدل فاست الحشوات المتدهورة وتختبر أداء البرج وفق إرشادات CTI ATC-105.",
    ],
  },
  {
    at: 0.77,
    part: "Basin",
    focus: [1.65, 0.63, 2.27],
    title: ["Cold-water basin & make-up line", "حوض الماء البارد وخط التعويض"],
    service: [
      "Water circuit & performance verification",
      "دائرة المياه والتحقق من الأداء",
    ],
    note: [
      "Cooled water collects in the basin. The float controls make-up water as the outlet returns water to the circuit. FAST lists a make-up-line replacement at SABIC Ar Razi and onsite testing of flow, range and approach.",
      "يتجمع الماء المبرد في الحوض وتضبط العوامة مياه التعويض فيما يعيد المخرج الماء إلى الدائرة. نفذت فاست استبدال خط التعويض لدى سابك الرازي وتشمل اختبارات الموقع التدفق والمدى والاقتراب الحراري.",
    ],
  },
];
export function coolingIndex(p: number) {
  if (p > 1.121 || p < 0.744) return -1;
  return Math.min(7, Math.max(0, Math.round((1.12 - p) / 0.05)));
}
function ease(t: number) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
export function moduleOpening(p: number, stage: number) {
  if (stage === 0) return 0;
  const start = coolingStops[stage - 1].at - 0.008;
  // On departure the basin retracts first and the outer casing closes last.
  const close = 0.705 + (stage - 1) * 0.004;
  return ease((start - p) / 0.038) * ease((p - close) / 0.032);
}
// First clear the frame sideways, then sweep the casing halves back. The fan stack
// lifts before the rotor. The same transforms anchor the marker and the guide's hand.
export function placeModule(name: TowerModule, p: number, position: Vector3) {
  const part = towerModules[name];
  const t = moduleOpening(p, part.stage);
  const [x, y, z] = part.offset;
  if (name === "LeftShell" || name === "RightShell") {
    const swing = ease((t - 0.7) / 0.3);
    position.set(x * ease(t / 0.73), y * t, z * swing);
    return (name === "LeftShell" ? -1 : 1) * 0.15 * swing;
  }
  const travel = name === "Rotor" ? ease((t - 0.2) / 0.8) : t;
  position.set(x * travel, y * travel, z * travel);
  return 0;
}
export function coolingFocus(index: number, p: number, out: Vector3) {
  const stop = coolingStops[index];
  const yaw = placeModule(stop.part, p, out);
  const [x, y, z] = stop.focus;
  out.x += towerOrigin[0] + x * Math.cos(yaw) + z * Math.sin(yaw);
  out.y += towerOrigin[1] + y;
  out.z += towerOrigin[2] + z * Math.cos(yaw) - x * Math.sin(yaw);
}
