import { destinations } from "../data/chapters";
export type ScrollStop = { at: number; y: number };
/** Separate scroll space for the long gallery, without lengthening the roof or lift. */
export function journeyScrollStops(): ScrollStop[] {
  const stops = destinations.map((id, i) => ({
    at: i,
    y:
      i === 12
        ? document.documentElement.scrollHeight - innerHeight
        : (document.getElementById(id)?.offsetTop ?? 0),
  }));
  for (const [id, at] of [
    ["about-hall", 1.53],
    ["about-departure", 1.74],
  ] as const) {
    const e = document.getElementById(id);
    if (e) stops.push({ at, y: e.offsetTop });
  }
  return stops.sort((a, b) => a.at - b.at);
}
export function progressAtScroll(y: number, stops = journeyScrollStops()) {
  let i = 0;
  while (i < stops.length - 2 && y >= stops[i + 1].y) i++;
  const a = stops[i],
    b = stops[i + 1];
  return (
    a.at +
    (b.at - a.at) * Math.max(0, Math.min(1, (y - a.y) / Math.max(1, b.y - a.y)))
  );
}
export function scrollAtProgress(p: number, stops = journeyScrollStops()) {
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1].at) i++;
  const a = stops[i],
    b = stops[i + 1];
  return (
    a.y + (b.y - a.y) * Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at)))
  );
}
