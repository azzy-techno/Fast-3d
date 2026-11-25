import { effect } from "@preact/signals";
import { finale, liftPhase, mode, scene, sound } from "./state";

/**
 * Opt-in ambience: one designed loop per floor, cross-faded on arrival, a chime when the lift doors open.
 * Nothing is fetched or played until the visitor turns sound on.
 */
const LOOP: Record<string, string> = {
  electrical: "electrical",
  mechanical: "mechanical",
  fabrication: "fabrication",
  civil: "civil",
  fire: "fire",
  ict: "it",
  digital: "manufacturing",
  roof: "cooling",
};
const base = import.meta.env.BASE_URL + "audio/";
let current: HTMLAudioElement | null = null;
let currentKey = "";
let timer = 0;

function fade(a: HTMLAudioElement, to: number, done?: () => void) {
  const step = () => {
    const d = to - a.volume;
    if (Math.abs(d) < 0.03) {
      a.volume = to;
      done?.();
      return;
    }
    a.volume = Math.min(1, Math.max(0, a.volume + Math.sign(d) * 0.03));
    setTimeout(step, 40);
  };
  step();
}

function play(key: string) {
  if (key === currentKey) return;
  const old = current;
  if (old) fade(old, 0, () => old.pause());
  current = null;
  currentKey = key;
  const file = LOOP[key];
  if (!file) return;
  const a = new Audio(base + file + ".ogg");
  a.loop = true;
  a.volume = 0;
  current = a;
  void a.play().then(
    () => fade(a, 0.32),
    () => {},
  );
}

export function initAudio() {
  effect(() => {
    const on = sound.value && mode.value === "tour" && !document.hidden;
    // the cooling-tower loop fades out as the camera leaves the roof for the closing shot
    const key = on && liftPhase.value !== "moving" && finale.value !== "farewell" ? scene.value : "";
    clearTimeout(timer);
    timer = window.setTimeout(() => play(key), 120);
  });
  effect(() => {
    if (sound.value && liftPhase.value === "opening") {
      const c = new Audio(base + "chime.wav");
      c.volume = 0.35;
      void c.play().catch(() => {});
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && current) current.pause();
    else if (current && sound.value) void current.play().catch(() => {});
  });
}
