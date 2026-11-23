import {
  electricalStations,
  electricalStationAt,
  ELECTRICAL_Y,
} from "./electricalTour";
import { mechanicalStations, mechanicalScope } from "../data/mechanical";
import { fabricationStations, fabricationScope } from "../data/fabrication";
import { fireStations, fireScope } from "../data/fire";
import { civilStations, civilScope } from "../data/civil";
import { electricalScope } from "../data/electrical";
import { createExhibitRoute } from "./exhibitRoute";
import {
  MECHANICAL_Y,
  mechanicalRoute,
  isMechanicalVisit,
} from "./mechanicalTour";
import { serviceLevel } from "./towerLayout";

export const FABRICATION_Y = serviceLevel(2);
export const fabricationRoute = createExhibitRoute(
  4,
  FABRICATION_Y,
  fabricationStations,
);
export const CIVIL_Y = serviceLevel(3);
export const civilRoute = createExhibitRoute(5, CIVIL_Y, civilStations);
export const FIRE_Y = serviceLevel(4);
export const fireRoute = createExhibitRoute(6, FIRE_Y, fireStations);
export const galleries = {
  electrical: {
    scopeSource: [
      "Scope informed by FAST’s 2026 company profiles. 3D equipment is illustrative.",
      "نطاق العمل وفق ملفات تعريف فاست لعام 2026. النماذج ثلاثية الأبعاد توضيحية.",
    ],
    name: "Electrical",
    posterPhoto: null,
    posterLines: [
      "Powering the building. Connecting every system.",
      "الخدمات الكهربائية — الطاقة والتحكم والربط",
    ],
    posterGroups: ["01  CONTRACTING", "02  AUTOMATION", "03  LV + ELV"],
    ar: "الكهرباء",
    start: 2,
    level: ELECTRICAL_Y,
    stations: electricalStations,
    scope: electricalScope,
    stationAt: electricalStationAt,
    photos: ["contracting.webp", "automation.webp", "installation.webp"],
    projectStart: 0,
    headline: ["Power. Control. Connection.", "الطاقة. التحكم. الربط."],
    intro: [
      "16 stations across electrical contracting, automation and LV / ELV infrastructure. Explore with your FAST engineer.",
      "16 محطة في المقاولات الكهربائية والأتمتة والبنية التحتية. اختر جولتك مع مهندس فاست.",
    ],
    wall: "POWER / CONTROL / CONNECTION",
    departments: "CONTRACTING / AUTOMATION / LV + ELV",
  },
  mechanical: {
    scopeSource: [
      "Project scope is drawn from FAST’s Mechanical page and 2026 company profile, pp. 9–10 and 49–50. The models illustrate the installations.",
      "المصدر: صفحة الخدمات الميكانيكية وملف فاست 2026، الصفحات 9–10 و49–50. النماذج توضيحية.",
    ],
    name: "Mechanical",
    posterPhoto: "mechanical/retrofit.webp",
    posterLines: [
      "A guided walk through industrial plant and pipework.",
      "الخدمات الميكانيكية — المعدات والأنابيب والمعالجة",
    ],
    posterGroups: [
      "01–04  THERMAL SYSTEMS",
      "05–10  PLANT & PIPING",
      "11–16  PROJECTS",
    ],
    ar: "الميكانيكا",
    start: 3,
    level: MECHANICAL_Y,
    stations: mechanicalStations,
    scope: mechanicalScope,
    stationAt: mechanicalRoute.stationAt,
    photos: [
      "cooling.webp",
      "machinery.webp",
      "pipework.webp",
      "project-ductwork.webp",
    ],
    projectStart: 11,
    headline: ["Inside the mechanical plant", "هندسة الأنظمة الميكانيكية"],
    intro: [
      "Explore ten core services and six project installations with your FAST engineer, from cooling towers to furnace exhausts and electric superheaters.",
      "رافق مهندس فاست في 16 محطة تشمل عشر خدمات ميكانيكية وستة تطبيقات من مشاريع الشركة.",
    ],
    wall: "HEAT TRANSFER / FLOW / MOTION",
    departments: "THERMAL SYSTEMS / MACHINERY / PIPEWORK",
  },
  fabrication: {
    scopeSource: [
      "Scope and project references come from FAST’s Fabrication page. Equipment models illustrate the work.",
      "من صفحة خدمات التصنيع وسجل مشاريع فاست. النماذج توضيحية.",
    ],
    name: "Fabrication",
    posterPhoto: "fabrication/yard.webp",
    posterLines: [
      "From welded steelwork to site installation.",
      "ورشة التصنيع — من تشكيل الفولاذ إلى التركيب في الموقع",
    ],
    posterGroups: [
      "01–06  FABRICATION",
      "07–08  FINISH & ERECT",
      "09–16  PROJECTS",
    ],
    ar: "التصنيع المعدني",
    start: 4,
    level: FABRICATION_Y,
    stations: fabricationStations,
    scope: fabricationScope,
    stationAt: fabricationRoute.stationAt,
    photos: ["skid.webp", "welding.webp", "erection.webp", "fitup.webp"],
    projectStart: 9,
    headline: ["Inside the fabrication yard", "داخل ورشة التصنيع"],
    intro: [
      "Start with the welded skid frame. Follow eight yard capabilities through finishing and site erection, then explore eight installations from FAST’s project portfolio.",
      "ابدأ بقاعدة المعدات الملحومة وتتبّع ثماني خدمات من تصنيع الورشة إلى التشطيب والتركيب، ثم استكشف ثمانية تطبيقات من مشاريع فاست.",
    ],
    wall: "CUTTING / FIT-UP / WELDING",
    departments: "SHOP FABRICATION / FINISHING / SITE ERECTION",
  },
  civil: {
    scopeSource: [
      "Sources: FAST Civil services and the 2026 company profile, pp. 11–12 and 49–50. Sections and project models illustrate the work.",
      "المصدر: صفحة الخدمات المدنية وملف فاست 2026، ص 11–12 و49–50. النماذج توضيحية.",
    ],
    name: "Civil",
    posterPhoto: "civil/site.webp",
    posterLines: [
      "From reinforced footings to finished surfaces.",
      "الأعمال المدنية — من الأساسات إلى التشطيبات",
    ],
    posterGroups: [
      "01–04  STRUCTURES",
      "05–10  SITE WORKS",
      "11–13  PROTECTION",
      "14–16  PROJECTS",
    ],
    ar: "الأعمال المدنية",
    start: 5,
    level: CIVIL_Y,
    stations: civilStations,
    scope: civilScope,
    stationAt: civilRoute.stationAt,
    photos: [
      "structures.webp",
      "groundworks.webp",
      "protection.webp",
      "projects.webp",
    ],
    projectStart: 14,
    headline: ["Beneath the finished surface", "تحت السطح النهائي"],
    intro: [
      "Look inside a reinforced footing, a road and a buried drain. Follow thirteen civil capabilities, then explore three projects from FAST’s company profile.",
      "استكشف مقاطع في قاعدة مسلّحة وطريق ومصرف مدفون. رافق المهندس عبر ثلاث عشرة خدمة مدنية ثم اكتشف ثلاثة مشاريع من ملف فاست.",
    ],
    wall: "STRUCTURES / GROUNDWORKS / PROTECTION",
    departments: "CIVIL WORKS / SELECTED PROJECTS",
  },
  fire: {
    scopeSource: [
      "Source: FAST Fire Protection and the 2026 company profile, pp. 15 and 50. The models illustrate the equipment and project scope.",
      "المصدر: صفحة الحماية من الحريق وملف شركة فاست 2026، ص 15 و50. النماذج توضيحية.",
    ],
    name: "Fire & protection",
    projectLabel: [
      "Visit the Amiral project · 16",
      "انتقل إلى مشروع أميرال · 16",
    ],
    ar: "الحريق والسلامة",
    start: 6,
    level: FIRE_Y,
    stations: fireStations,
    scope: fireScope,
    stationAt: fireRoute.stationAt,
    photos: [
      "systems.webp",
      "maintenance.webp",
      "supply.webp",
      "installation.webp",
    ],
    posterPhoto: "fire/overview.webp",
    posterLines: [
      "From the first alarm to the fire pump.",
      "من أول إنذار إلى مضخة الحريق",
    ],
    posterGroups: [
      "01–08  SYSTEMS",
      "09–13  MAINTENANCE",
      "14–15  SUPPLY",
      "16  AMIRAL",
    ],
    projectStart: 16,
    headline: [
      "Inside the fire protection system",
      "داخل منظومة الحماية من الحريق",
    ],
    intro: [
      "Follow the engineer from the alarm panel to the pump set and hose reel. Explore inspection and maintenance, then visit the Amiral fire detection exhibit.",
      "رافق المهندس من لوحة الإنذار إلى مجموعة المضخة وبكرة الخرطوم، ثم استكشف الفحص والصيانة وأعمال كشف الحريق في مشروع أميرال.",
    ],
    wall: "DETECTION / SUPPRESSION / WATER SUPPLY",
    departments: "FIRE & LIFE SAFETY / PROJECT GALLERY",
  },
} as const;
export type GalleryId = keyof typeof galleries;
export const galleryOrder = [
  "electrical",
  "mechanical",
  "fabrication",
  "civil",
  "fire",
] as const satisfies readonly GalleryId[];
export function isGallery(id: string): id is GalleryId {
  return Object.prototype.hasOwnProperty.call(galleries, id);
}
export function independentGalleryAt(p: number) {
  if (isMechanicalVisit(p)) return "mechanical";
  if (p >= 4 && p <= 4.80001) return "fabrication";
  if (p >= 5 && p <= 5.80001) return "civil";
  if (p >= 6 && p <= 6.80001) return "fire";
  return null;
}
export const independentRoutes = {
  mechanical: mechanicalRoute,
  fabrication: fabricationRoute,
  civil: civilRoute,
  fire: fireRoute,
};
