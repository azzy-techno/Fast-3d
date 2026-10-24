import { Vector3 } from "three";
import type { Point } from "../data/chapters";

export const serviceRooms = Array.from({ length: 10 }, (_, i) => ({
  index: i + 1,
  x: i % 2 === 0 ? -6.6 : 6.6,
  z: -4 - Math.floor(i / 2) * 7.2,
  side: i % 2 === 0 ? -1 : 1,
}));
export const journeyState = { progress: 0, section: "arrival" };
type Shot = { at: number; p: Point; target: Point; fov: number };
const frames: Shot[] = [];
const shot = (at: number, p: Point, target: Point, fov = 62) =>
  frames.push({ at, p, target, fov });
shot(0, [49, 29, 67], [0, 10, -5], 42);
shot(0.22, [47, 30, 63], [0, 11, -4], 42);
shot(0.55, [15, 27, 14], [8, 24, 5], 48);
shot(0.7, [11, 25.1, 10], [8, 24.1, 5], 54);
shot(0.86, [10, 25.05, 9], [3, 24.2, -1], 58);
shot(1, [9, 25.05, 8], [0, 24.4, -1], 62);
shot(1.12, [9, 25.05, 7.8], [0, 24.4, -1], 62);
shot(1.28, [11, 25, 2], [11, 25, -5], 62);
shot(1.37, [11, 24.8, -5], [11, 24.8, -9], 66);
shot(1.4, [11, 23, -5], [7, 23, -5], 66);
shot(1.44, [11, 20, -5], [9, 20, 1], 66);
shot(1.48, [11, 17.7, -5], [11, 17.7, 3], 66);
shot(1.53, [10.2, 17.7, 0.5], [6.4, 17.2, -5], 68);
shot(1.58, [11, 17.7, 3.8], [2, 17.6, 3.8], 66);
shot(1.67, [4, 17.7, 3.8], [-6, 17.5, -1], 66);
shot(1.74, [0, 17.7, 2], [0, 17.7, -7], 66);
shot(1.82, [0, 17.7, -7], [0, 17.7, -11], 66);
shot(1.85, [0, 14, -7], [4, 14, -7], 66);
shot(1.88, [0, 9, -7], [3, 9, -2], 66);
shot(1.9, [0, 7.7, -7], [0, 7.7, 0], 66);
shot(1.95, [0, 7.7, -1], [-6.6, 7.5, -4], 66);
for (let i = 0; i < serviceRooms.length; i++) {
  const room = serviceRooms[i],
    next = serviceRooms[i + 1];
  const at = i + 2;
  const p: Point = [room.side * 3.5, 8.05, room.z + 3.2];
  const target: Point = [
    room.x + (room.side < 0 ? 1.2 : 0),
    7.45,
    room.z - 0.6,
  ];
  shot(at, p, target, 74);
  shot(at + 0.2, [p[0] + room.side * 0.12, p[1], p[2] - 0.12], target, 74);
  if (next) {
    shot(
      at + 0.38,
      [room.side * 2.1, 7.7, room.z + 3.1],
      [0, 7.6, room.z + 1],
      68,
    );
    shot(at + 0.51, [0, 7.7, room.z + 3.1], [0, 7.6, next.z - 2], 68);
    shot(at + 0.68, [0, 7.7, next.z + 3.1], [next.x, 7.5, next.z], 68);
    shot(
      at + 0.84,
      [next.side * 2.1, 7.7, next.z + 3.1],
      [next.x, 7.5, next.z - 0.6],
      68,
    );
  }
}
// Enter the rear lift, descend to ground, then walk the reception approach.
shot(11.4, [2.1, 7.7, -29.7], [0, 7.7, -35], 68);
shot(11.44, [0, 7.7, -32], [0, 7.7, -38], 68);
shot(11.49, [0, 7.7, -34], [0, 7.7, -40], 66);
shot(11.53, [0, 7.7, -37], [0, 7.7, -41], 66);
shot(11.55, [0, 5.2, -37], [4, 5.2, -37], 66);
shot(11.58, [0, 1.95, -37], [3, 1.95, -32], 66);
shot(11.61, [0, 1.95, -31], [0, 1.8, -26], 66);
shot(11.65, [0, 1.95, -11], [-4, 1.8, -3], 66);
shot(11.69, [0, 1.95, 4.5], [-6, 1.6, 1.8], 66);
shot(11.715, [1, 1.95, 4.5], [9, 1.5, 2.5], 66);
shot(11.73, [2.4, 1.95, 4.8], [3, 1.8, 10], 64);
shot(11.77, [3, 1.95, 8], [3, 1.6, 16], 62);
shot(11.81, [3, 1.95, 13], [3, 1.6, 20], 60);
shot(11.85, [6, 2.2, 22], [3, 1.3, 18], 54);
shot(11.89, [9, 4.5, 27], [3, 1.2, 18], 50);
shot(11.94, [22, 16, 38], [1, 9, 1], 46);
shot(12, [40, 32, 47], [0, 8, -9], 42);

// Shape-preserving cubic Hermite interpolation: continuous velocity, no spline
// overshoot through a wall, and deterministic forward/reverse scrubbing.
function slope(
  prev: number,
  value: number,
  next: number,
  dt0: number,
  dt1: number,
) {
  const a = (value - prev) / dt0,
    b = (next - value) / dt1;
  if (a * b <= 0) return 0;
  const w1 = 2 * dt1 + dt0,
    w2 = dt1 + 2 * dt0;
  return (w1 + w2) / (w1 / a + w2 / b);
}
function scalar(i: number, t: number, get: (frame: Shot) => number) {
  const a = frames[i],
    b = frames[i + 1],
    prev = frames[Math.max(0, i - 1)],
    next = frames[Math.min(frames.length - 1, i + 2)];
  const dt = b.at - a.at,
    va = get(a),
    vb = get(b);
  const ma = i === 0 ? 0 : slope(get(prev), va, vb, a.at - prev.at, dt);
  const mb =
    i + 2 === frames.length ? 0 : slope(va, vb, get(next), dt, next.at - b.at);
  const t2 = t * t,
    t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * va +
    (t3 - 2 * t2 + t) * dt * ma +
    (-2 * t3 + 3 * t2) * vb +
    (t3 - t2) * dt * mb
  );
}
const getters = {
  p: [0, 1, 2].map((axis) => (frame: Shot) => frame.p[axis]),
  target: [0, 1, 2].map((axis) => (frame: Shot) => frame.target[axis]),
  fov: (frame: Shot) => frame.fov,
};
export function sampleJourney(
  progress: number,
  position: Vector3,
  target: Vector3,
) {
  const p = Math.max(0, Math.min(12, progress));
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1].at) i++;
  const t = (p - frames[i].at) / (frames[i + 1].at - frames[i].at);
  for (let axis = 0; axis < 3; axis++) {
    position.setComponent(axis, scalar(i, t, getters.p[axis]));
    target.setComponent(axis, scalar(i, t, getters.target[axis]));
  }
  return scalar(i, t, getters.fov);
}
export function journeyBeat(progress: number) {
  if (progress < 0.65)
    return [
      "01 / THE ARRIVAL",
      "One address. An entire ecosystem.",
      "A journey through the systems that make a building work.",
    ];
  if (progress < 1.22)
    return [
      "02 / ABOVE THE CITY",
      "It begins with a breath.",
      "Rooftop cooling keeps everything below in balance.",
    ];
  if (progress < 1.47)
    return [
      "03 / CROSS THE THRESHOLD",
      "Follow the building inward.",
      "From the roof, descend into the spaces these systems serve.",
    ];
  if (progress < 1.73)
    return [
      "04 / THE HUMAN SIDE",
      "Built around the people inside.",
      "Workspaces, meeting rooms and quiet corners. Every space, connected.",
    ];
  if (progress < 1.96)
    return [
      "05 / BELOW THE SURFACE",
      "Behind every working day.",
      "The service lift takes us to the infrastructure at the heart of the building.",
    ];
  if (progress < 7.5)
    return [
      "06 / THE SERVICE GALLERY",
      "Follow the connections.",
      "Power, water, structure and protection — one continuous system.",
    ];
  if (progress < 11.4)
    return [
      "07 / THE INTELLIGENT FLOOR",
      "From infrastructure to intelligence.",
      "Connected equipment becomes insight. Insight becomes action.",
    ];
  if (progress < 11.64)
    return [
      "08 / THE RETURN",
      "Back to where people meet.",
      "Follow your guide to the lift. Next stop: reception.",
    ];
  if (progress < 11.83)
    return [
      "09 / THE RECEPTION",
      "A warm welcome. A lasting connection.",
      "Through the reception lounge and out into the city.",
    ];
  return [
    "10 / UNTIL NEXT TIME",
    "Every discipline. One partner.",
    "Step back and see how it all comes together.",
  ];
}

// Arc-length lookahead keeps the host on the very same doorway-constrained route.
const arc: number[] = [0];
const arcP = new Vector3(),
  arcPrevious = new Vector3(),
  arcTarget = new Vector3();
for (let i = 0; i <= 12000; i++) {
  sampleJourney(i / 1000, arcP, arcTarget);
  if (i)
    arc[i] =
      arc[i - 1] + Math.hypot(arcP.x - arcPrevious.x, arcP.z - arcPrevious.z);
  arcPrevious.copy(arcP);
}
export function routeDistance(p: number) {
  const n = Math.max(0, Math.min(12000, p * 1000)),
    i = Math.floor(n);
  return arc[i] + (arc[Math.min(12000, i + 1)] - arc[i]) * (n - i);
}
export function sampleGuide(p: number, position: Vector3, facing: Vector3) {
  if (p >= 1.9 && p <= 11.53) {
    sampleServiceGuide(p, position, facing);
    return;
  }
  if (p <= 0.7) {
    position.set(8, 23, 5);
    facing.set(12, 24, 12);
    return;
  }
  if (p >= 11.84) {
    position.set(3, 0.25, 18);
    facing.set(3, 1.5, 25);
    return;
  }
  const smooth = (a: number, b: number) => {
    const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const liftBlend = Math.max(
    smooth(1.27, 1.34) * (1 - smooth(1.49, 1.56)),
    smooth(1.73, 1.79) * (1 - smooth(1.91, 1.96)),
    smooth(11.46, 11.5) * (1 - smooth(11.6, 11.64)),
  );
  const distance = routeDistance(p) + 2.6 * (1 - liftBlend);
  let i = Math.floor(p * 1000);
  while (i < 11840 && arc[i] < distance) i++;
  const span = arc[i] - arc[Math.max(0, i - 1)];
  const lead = Math.max(
    p,
    (i - 1 + (span > 0 ? (distance - arc[i - 1]) / span : 1)) / 1000,
  );
  sampleJourney(lead, position, facing);
  sampleJourney(p, arcP, arcTarget);
  const floor =
    p < 1.375
      ? 23
      : p < 1.48
        ? Math.max(16, arcP.y - 1.7)
        : p < 1.82
          ? 16
          : p < 1.9
            ? Math.max(6, arcP.y - 1.7)
            : p < 11.53
              ? 6
              : p < 11.58
                ? Math.max(0.25, arcP.y - 1.7)
                : 0.25;
  position.y = floor;
  position.x += liftBlend * 0.65;
  position.z -= liftBlend * 0.85;
  if (p > 0.7 && p < 1.28) {
    const weight = smooth(0.7, 0.86) * (1 - smooth(1.14, 1.28));
    sampleJourney(1, arcP, arcTarget);
    arcTarget.sub(arcP).setY(0).normalize().multiplyScalar(2.8).add(arcP);
    arcTarget.y = 23;
    position.lerp(arcTarget, weight);
    if (p >= 0.86 && p <= 1.14) facing.set(0, 24.5, -1);
  }
  if (p > 11.81) position.set(3, 0.25, Math.min(18, position.z));
  if (p < 0.86)
    position.lerp(new Vector3(8, 23, 5), 1 - Math.min(1, (p - 0.7) / 0.16));
}

// The guide uses the front visitor aisle and the outer presentation bay.
// Equipment is contained inside +/-3.3 m of the room centre, ending at z+1.65.
// Camera and guide use separate lanes through the 1.9 m door opening.
export const exhibitEnvelope = { halfWidth: 3.3, front: 1.65, back: -3.15 };
export const presentationX = 10.55;
const exhibitFocus: Point[] = [
  [0, 3, 0.85],
  [0, 0.7, 0],
  [1.5, 1.5, 2.3],
  [0, 1.9, 2.7],
  [0, 2.65, 0],
  [0, 2.1, 0],
  [0, 1.9, 1],
  [0, 3.4, -2.68],
  [0.2, 1.45, 1],
  [0.8, 3.8, 1],
];
type GuideKey = { at: number; p: Point; room: number };
const guideKeys: GuideKey[] = [];
const guideKey = (at: number, p: Point, room: number) =>
  guideKeys.push({ at, p, room });
guideKey(1.9, [0.65, 6, -7.85], 0);
guideKey(1.92, [0.65, 6, -3], 0);
guideKey(1.94, [-2.1, 6, -1.95], 0);
for (let i = 0; i < serviceRooms.length; i++) {
  const room = serviceRooms[i],
    next = serviceRooms[i + 1],
    at = i + 2;
  const bay = room.side < 0 ? -2.85 : presentationX,
    parkZ = room.side < 0 ? -1.5 : 0.6;
  guideKey(at - (i === 0 ? 0.045 : 0.1), [bay, 6, room.z + 2.05], i);
  guideKey(at - (i === 0 ? 0.02 : 0.04), [bay, 6, room.z + parkZ], i);
  guideKey(at + 0.28, [bay, 6, room.z + parkZ], i);
  guideKey(at + (next ? 0.38 : 0.35), [bay, 6, room.z + 2.05], i);
  guideKey(at + (next ? 0.54 : 0.44), [room.side * 2.1, 6, room.z + 2.05], i);
  if (next) {
    guideKey(at + 0.62, [room.side * 1.3, 6, room.z + 2.05], i);
    guideKey(at + 0.72, [room.side * 1.3, 6, next.z + 2.05], i + 1);
    guideKey(at + 0.78, [next.side * 2.1, 6, next.z + 2.05], i + 1);
  } else {
    guideKey(11.48, [0.65, 6, -33.5], i);
    guideKey(11.51, [0.65, 6, -35.2], i);
    guideKey(11.53, [0.65, 6, -37.85], i);
  }
}
export function guideExhibit(p: number) {
  if (p < 1.9 || p > 11.53) return null;
  let i = 0;
  while (i < guideKeys.length - 2 && p > guideKeys[i + 1].at) i++;
  return serviceRooms[guideKeys[i + 1].room];
}
function sampleServiceGuide(p: number, position: Vector3, facing: Vector3) {
  let i = 0;
  while (i < guideKeys.length - 2 && p > guideKeys[i + 1].at) i++;
  const a = guideKeys[i],
    b = guideKeys[i + 1],
    t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at))),
    u = t * t * (3 - 2 * t);
  position.set(
    a.p[0] + (b.p[0] - a.p[0]) * u,
    a.p[1] + (b.p[1] - a.p[1]) * u,
    a.p[2] + (b.p[2] - a.p[2]) * u,
  );
  const room = serviceRooms[b.room];
  const focus = exhibitFocus[b.room];
  facing.set(
    room.x + focus[0] * 0.55,
    6.08 + focus[1] * 0.55,
    room.z - 0.55 + focus[2] * 0.55,
  );
}

export function guideIsPresenting(p: number) {
  if (p >= 0.86 && p <= 1.14) return true;
  const at = Math.round(p);
  return (
    at >= 2 && at <= 11 && p >= at - (at === 2 ? 0.02 : 0.04) && p <= at + 0.28
  );
}
