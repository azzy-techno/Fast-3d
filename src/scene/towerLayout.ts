export const ROOF_LEVEL = 83;
export const OFFICE_LEVEL = 76;
export const SERVICE_TOP = 66;
export const FLOOR_PITCH = 6;
export const serviceLevel = (index: number) =>
  SERVICE_TOP - index * FLOOR_PITCH;
export const LAST_SERVICE_LEVEL = serviceLevel(9);
