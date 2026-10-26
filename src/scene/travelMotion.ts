import { serviceLevel } from "./towerLayout";
/** Deterministic motion shared by forward/reverse scroll and regression checks. */
export function liftDoorOpen(
  progress: number,
  kind: "roof" | "service" | "exit",
) {
  const smooth = (a: number, b: number) => {
    const t = Math.max(0, Math.min(1, (progress - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return kind === "exit"
    ? 1 - smooth(11.5, 11.53) + smooth(11.58, 11.6)
    : kind === "roof"
      ? 1 - smooth(1.32, 1.37) + smooth(1.48, 1.52)
      : 1 - smooth(1.79, 1.82) + smooth(1.9, 1.94);
}
export function trafficPosition(seconds: number, index: number) {
  const distance = seconds * (index % 2 === 0 ? 3 : -3) + index * 157 + 700;
  return (((distance % 2000) + 2000) % 2000) - 1000;
}

export function stackLiftFloor(p: number) {
  const i = Math.max(0, Math.min(9, Math.floor(p) - 2));
  const t = Math.max(0, Math.min(1, (p - (i + 2 + 0.6)) / 0.16));
  return (
    serviceLevel(i) +
    (serviceLevel(Math.min(9, i + 1)) - serviceLevel(i)) * t * t * (3 - 2 * t)
  );
}
export function stackDoorOpen(p: number) {
  if (p < 2 || p >= 11) return 1;
  const t = p - Math.floor(p);
  const ease = (a: number, b: number) => {
    const n = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return n * n * (3 - 2 * n);
  };
  return 1 - ease(0.54, 0.6) + ease(0.76, 0.8);
}
