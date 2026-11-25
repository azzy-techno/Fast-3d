import type { SceneId } from "../../state";
import type { Engine } from "../Engine";
import type { TourScene } from "../scene";
import { ArrivalScene } from "./arrival";
import { FloorScene } from "./floor";
import { RoofScene } from "./roof";

export function createScene(id: SceneId, engine: Engine): TourScene {
  if (id === "arrival") return new ArrivalScene(id, engine);
  if (id === "roof") return new RoofScene(id, engine);
  return new FloorScene(id, engine);
}
