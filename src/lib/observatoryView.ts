export const OBSERVATORY_AT = 1.605;
export const OBSERVATORY_EXIT = 1.675;

export function insideEyepiece(p: number) {
  return p >= 1.602 && p < 1.639;
}

// Mutable optical pose: pointer motion must not rerender the React scene tree.
export const observatoryView = { x: 0, y: 0 };
export function lookThroughObservatory(x: number, y: number) {
  if (Math.abs(x - observatoryView.x) + Math.abs(y - observatoryView.y) < 0.001)
    return;
  observatoryView.x = x;
  observatoryView.y = y;
  window.dispatchEvent(new Event("fast-observatory-look"));
}
