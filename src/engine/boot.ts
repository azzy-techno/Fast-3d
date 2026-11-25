import { bindEngine } from "../bridge";
import { initialScene, isScene, mode, noWebgl } from "../state";
import { Engine } from "./Engine";
import { createScene } from "./scenes";
import type { ArrivalScene } from "./scenes/arrival";

/** Start the 3D tour on the given canvas. Throws if WebGL is unavailable. */
export async function boot(canvas: HTMLCanvasElement, stage: HTMLElement, labels: HTMLElement) {
  let engine: Engine;
  try {
    engine = new Engine(canvas, stage, labels, createScene);
  } catch (e) {
    noWebgl.value = true;
    throw e;
  }
  canvas.addEventListener("webglcontextlost", (e) => e.preventDefault());
  bindEngine(engine, () => {
    const a = engine.sceneFor("arrival") as ArrivalScene;
    a.fromLift = false;
    if (engine.current === a) engine.jumpTo("street");
    else void engine.travel("arrival");
  });
  // Arriving at reception by lift (rather than from the street) starts in front of the lift doors.
  const arrival = engine.sceneFor("arrival") as ArrivalScene;
  arrival.fromLift = initialScene !== "arrival";
  await engine.start(initialScene);
  arrival.fromLift = true;
  // the visitor may have switched to the overview while 3D was loading: do not render behind it
  if (mode.peek() !== "tour") engine.stop();
  // deep links and the back button: #electrical rides the lift to that floor
  window.addEventListener("hashchange", () => {
    const id = location.hash.replace(/^#\/?/, "");
    const target = id === "" ? "arrival" : id;
    if (isScene(target) && engine.current?.id !== target) void engine.travel(target);
  });
  return engine;
}
