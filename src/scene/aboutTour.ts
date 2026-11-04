import { Vector3 } from "three";
import {
  certifications,
  credentials,
  registrations,
  partners,
  type AboutPanel,
} from "../data/about";
import type { Point } from "../data/chapters";
export const ABOUT_START = 1.53,
  ABOUT_END = 1.74,
  ABOUT_Y = 76;
export const aboutItems: {
  title: string;
  ar: string;
  note: string;
  noteAr: string;
  panel: AboutPanel;
  image: string;
  partnerId?: string;
  document?: string;
}[] = [
  ...certifications.map((c) => ({
    title: `ISO ${c.code}:${c.edition}`,
    ar: `ISO ${c.code}:${c.edition}`,
    note: c.name,
    noteAr: c.ar,
    panel: "certifications" as const,
    image: `about/certificates/iso-${c.code}.webp`,
    document: `about/certificates/iso-${c.code}.pdf`,
  })),
  ...credentials.map((c, i) => ({
    title: c.name,
    ar: c.ar,
    note: c.detail,
    noteAr: c.arDetail,
    panel: "certifications" as const,
    image: `about/certificates/${i ? "salamah" : "lcgpa"}.webp`,
    document: c.url,
  })),
  ...registrations.map((r) => ({
    title: r.name,
    ar: r.ar,
    note: r.detail || "Supplier portal registration",
    noteAr: r.arDetail || "تسجيل في بوابة الموردين",
    panel: "approvals" as const,
    image: r.logo,
  })),
  ...partners.map((p) => ({
    title: p.name,
    ar: p.arName,
    note: p.description,
    noteAr: p.arDescription,
    panel: "partners" as const,
    image: p.logo,
    partnerId: p.id,
  })),
];
export const aboutStations = aboutItems.map((item, i) => {
  let x: number, z: number, rotation: number;
  if (i < 10) {
    x = -30;
    z = 2 + i * 6;
    rotation = Math.PI / 2;
  } else if (i < 19) {
    x = -24 + (i - 10) * 6;
    z = 64;
    rotation = Math.PI;
  } else if (i < 29) {
    x = 30;
    z = 56 - (i - 19) * 6;
    rotation = -Math.PI / 2;
  } else {
    x = [18, 6, -6, -18][i - 29];
    z = 12;
    rotation = 0;
  }
  return {
    ...item,
    number: i + 1,
    x,
    z,
    rotation,
    at: 1.548 + i * 0.00525,
    end: 1.5498 + i * 0.00525,
  };
});
export function aboutPoint(
  s: (typeof aboutStations)[number],
  x: number,
  y: number,
  z: number,
): Point {
  return [
    s.x + x * Math.cos(s.rotation) + z * Math.sin(s.rotation),
    ABOUT_Y + y,
    s.z - x * Math.sin(s.rotation) + z * Math.cos(s.rotation),
  ];
}
export function aboutStationAt(p: number) {
  if (p < 1.546 || p > 1.72) return null;
  return (
    [...aboutStations].reverse().find((s) => p >= s.at - 0.0018) ||
    aboutStations[0]
  );
}
export function aboutPresenting(p: number) {
  return aboutStations.some((s) => p >= s.at && p <= s.end);
}
type Key = { at: number; camera: Point; guide: Point; target: Point };
const keys: Key[] = [];
function key(at: number, camera: Point, guide: Point, target: Point) {
  keys.push({ at, camera, guide, target });
}
key(
  ABOUT_START,
  [10.2, 77.7, 0.5],
  [9.537699120703023, 76, 1.3677673253017808],
  [6.4, 77.2, -5],
);
key(1.534, [6, 78.2, 6], [2, 76, 8], [0, 79, 12]);
key(1.538, [6, 78.2, 6], [2, 76, 8], [0, 79, 12]);
key(1.541, [-19, 78.2, -0.5], [-23, 76, -0.5], [-28, 78, 2]);
for (const s of aboutStations) {
  const cam = aboutPoint(s, 1.3, 2.25, 7.2),
    guide = aboutPoint(s, 2.8, 0, 3.4),
    target = aboutPoint(s, 0, 2.35, 0.1);
  key(s.at, cam, guide, target);
  key(s.end, cam, guide, target);
  if (s.number === 29)
    key(s.end + 0.0014, [27, 78.25, 19.2], [27, 76, 15.4], [22, 78, 12]);
}
key(1.721, [-24, 78.25, 19.2], [-24, 76, 15.4], [-24, 78, 3]);
key(1.729, [-24, 78.25, -1], [-24, 76, -3], [0, 78, -1]);
key(
  1.737,
  [0, 77.7, 2],
  [0.04814814814814815, 76, -0.47022016012967677],
  [0, 77.7, -7],
);
key(
  ABOUT_END,
  [0, 77.7, 2],
  [0.04814814814814815, 76, -0.47022016012967677],
  [0, 77.7, -7],
);
export const aboutRouteKeys = keys;
function sample(p: number, field: "camera" | "guide" | "target", out: Vector3) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].at) i++;
  const a = keys[i],
    b = keys[i + 1],
    t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))),
    u = t * t * (3 - 2 * t);
  for (let axis = 0; axis < 3; axis++)
    out.setComponent(
      axis,
      a[field][axis] + (b[field][axis] - a[field][axis]) * u,
    );
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
  const s = aboutStationAt(p);
  if (s) target.set(...aboutPoint(s, 0, 2.65, 0.15));
  else sample(p, "target", target);
}
