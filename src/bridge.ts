import type { Engine } from "./engine/Engine";
import type { SceneId } from "./state";

/** Thin handle the interface uses to drive the 3D engine without importing it (the engine loads lazily). */
let engine: Engine | null = null;
let restartHook: (() => void) | null = null;
export const bindEngine = (e: Engine, onRestart: () => void) => {
  engine = e;
  restartHook = onRestart;
};
export const hasEngine = () => !!engine;
export const travel = (to: SceneId) => void engine?.travel(to);
export const restartFromStreet = () => restartHook?.();
export const step = (dir: 1 | -1) => engine?.step(dir);
export const goStation = (i: number) => engine?.goStation(i);
export const jumpTo = (shot: string) => engine?.jumpTo(shot);
export const setLayout = (x: number, y: number) => engine?.setLayout(x, y);
export const pauseEngine = () => engine?.stop();
export const resumeEngine = () => engine?.run();
export const sceneCall = (name: string) => {
  const s = engine?.current as unknown as Record<string, unknown> | null;
  const fn = s?.[name];
  if (typeof fn === "function") (fn as () => void).call(s);
};
