import { mechanicalStations } from "../data/mechanical";
import { createExhibitRoute } from "./exhibitRoute";
import { serviceLevel } from "./towerLayout";

export const MECHANICAL_Y = serviceLevel(1);
export const mechanicalRoute = createExhibitRoute(
  3,
  MECHANICAL_Y,
  mechanicalStations,
);
export function isMechanicalVisit(p: number) {
  return p >= 3 && p <= 3.80001;
}
