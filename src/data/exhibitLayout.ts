// Four aisles, walked in alternating directions from the entry to the rear lift.
export function exhibitBay(start: number, index: number) {
  const row = Math.floor(index / 4);
  const column = row % 2 ? 3 - (index % 4) : index % 4;
  return {
    x: [-21, -7, 7, 21][column],
    z: 8 + row * 12,
    at: start + 0.045 + index * 0.044,
    end: start + 0.057 + index * 0.044,
  };
}
