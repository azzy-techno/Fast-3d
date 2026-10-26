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
  const distance = seconds * (index % 2 === 0 ? 3 : -3) + index * 79;
  return (((distance % 1000) + 1000) % 1000) - 500;
}
