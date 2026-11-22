import {
  electricalStations,
  electricalStationAt,
  ELECTRICAL_Y,
} from "./electricalTour";
import { mechanicalStations, mechanicalScope } from "../data/mechanical";
import { fabricationStations, fabricationScope } from "../data/fabrication";
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
export const galleries = {
  electrical: {
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
} as const;
export type GalleryId = keyof typeof galleries;
export const galleryOrder = [
  "electrical",
  "mechanical",
  "fabrication",
  "civil",
] as const satisfies readonly GalleryId[];
export function isGallery(id: string): id is GalleryId {
  return Object.prototype.hasOwnProperty.call(galleries, id);
}
export function independentGalleryAt(p: number) {
  if (isMechanicalVisit(p)) return "mechanical";
  if (p >= 4 && p <= 4.80001) return "fabrication";
  if (p >= 5 && p <= 5.80001) return "civil";
  return null;
}
export const independentRoutes = {
  mechanical: mechanicalRoute,
  fabrication: fabricationRoute,
  civil: civilRoute,
};
