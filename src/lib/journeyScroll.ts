import { chapters } from "../data/chapters";

export const EXTERIOR_ARRIVAL = 12;

/** Each floor is an independent visit. Values reference the authored camera and
 * guide poses; the end of each visit is on the landing outside the lift. */
export const floors = [
  {
    id: "reception",
    title: "Reception",
    ar: "الاستقبال",
    floor: "G",
    start: 11.69,
    end: 11.61,
  },
  ...chapters.slice(1).map((c, i) => ({
    id: c.id,
    title: c.title,
    ar: c.ar,
    floor: String(i + 1).padStart(2, "0"),
    start: i + 2,
    end: i < 6 ? i + 2.8 : i === 9 ? 11.48 : i + 2 + 0.46,
  })),
  {
    id: "about",
    title: "About FAST",
    ar: "عن فاست",
    floor: "11",
    start: 1.535,
    end: 1.74,
  },
  {
    id: "cooling",
    title: chapters[0].title,
    ar: chapters[0].ar,
    floor: "R",
    start: 1.12,
    end: 0,
  },
];
export type Floor = (typeof floors)[number];
export function floorStops(floor: Floor): [number, number][] {
  if (floor.id === "cooling")
    return [
      [0, 1.12],
      [0.34, 0.94],
      [0.5, 0.68],
      [0.68, 0.55],
      [1, floor.end],
    ];
  if (floor.id === "reception")
    return [
      [0, EXTERIOR_ARRIVAL],
      [0.2, 11.94],
      [0.34, 11.89],
      [0.48, 11.84],
      [0.64, 11.77],
      [0.75, floor.start],
      [0.85, 11.665],
      [1, 11.61],
    ];
  return [
    [0, floor.start],
    [1, floor.end],
  ];
}
function interpolate(
  value: number,
  stops: [number, number][],
  reverse: boolean,
) {
  const input = reverse ? 1 : 0,
    output = reverse ? 0 : 1;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1],
      b = stops[i];
    const t = (value - a[input]) / (b[input] - a[input]);
    if (t <= 1 || i === stops.length - 1)
      return a[output] + (b[output] - a[output]) * Math.min(1, Math.max(0, t));
  }
  return stops[0][output];
}
export const floorProgress = (floor: Floor, fraction: number) =>
  interpolate(fraction, floorStops(floor), false);
export const floorFraction = (floor: Floor, pose: number) =>
  interpolate(pose, floorStops(floor), true);
export function scrollRange() {
  const end = document.querySelector<HTMLElement>(".tour-view #together");
  // Hold the final skyline shot while visitors read or expand the closing contacts.
  return Math.max(
    1,
    Math.min(
      document.documentElement.scrollHeight - innerHeight,
      end?.offsetTop ?? Infinity,
    ),
  );
}
