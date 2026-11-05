// Mutable optical pose: pointer motion must not rerender the React scene tree.
export const observatoryView = { x: 0, y: 0 };
export function lookThroughObservatory(x: number, y: number) {
  if (Math.abs(x - observatoryView.x) + Math.abs(y - observatoryView.y) < 0.001)
    return;
  observatoryView.x = x;
  observatoryView.y = y;
  window.dispatchEvent(new Event("fast-observatory-look"));
}
