import {
  electricalStations,
  electricalStationAt,
  ELECTRICAL_Y,
} from "./electricalTour";
import { mechanicalStations, mechanicalScope } from "../data/mechanical";
import { fabricationStations, fabricationScope } from "../data/fabrication";
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
export const galleries = {
  electrical: {
    name: "Electrical",
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
} as const;
export type GalleryId = keyof typeof galleries;
export function isGallery(id: string): id is GalleryId {
  return id === "electrical" || id === "mechanical" || id === "fabrication";
}
export function independentGalleryAt(p: number) {
  if (isMechanicalVisit(p)) return "mechanical";
  if (p >= 4 && p <= 4.80001) return "fabrication";
  return null;
}
export const independentRoutes = {
  mechanical: mechanicalRoute,
  fabrication: fabricationRoute,
};
