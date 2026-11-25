import { signal, computed } from "@preact/signals";
import { floors } from "./content/floors";
import type { Floor, FloorId } from "./content/types";

export type Lang = "en" | "ar";
export type SceneId = "arrival" | FloorId;
export type Mode = "tour" | "lite";

const params = new URLSearchParams(location.search);
const storedLang = (() => {
  try {
    return localStorage.getItem("fast-lang");
  } catch {
    return null;
  }
})();

export const lang = signal<Lang>(
  params.get("lang") === "ar" || (!params.get("lang") && (storedLang === "ar" || (!storedLang && navigator.language?.startsWith("ar")))) ? "ar" : "en",
);
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** `?view=list` or reduced motion start in the fast route; `?view=tour` forces 3D. */
export const mode = signal<Mode>(params.get("view") === "list" || (reducedMotion && params.get("view") !== "tour") ? "lite" : "tour");

export const floorById = (id: string): Floor | undefined => floors.find((f) => f.id === id);
export const isScene = (id: string): id is SceneId => id === "arrival" || !!floorById(id);
const hash = location.hash.replace(/^#\/?/, "");
/** Deep link straight to a floor: /#electrical */
export const initialScene: SceneId = isScene(hash) ? hash : "arrival";

/** Scene the visitor is in (changes while the lift doors are closed). */
export const scene = signal<SceneId>(initialScene);
/** Index of the current stop in the scene, -1 between stops. */
export const station = signal(-1);
/** True while the camera is resting at the current stop (not travelling between stops). */
export const arrived = signal(false);
/** 3D has drawn its first frame. */
export const ready3d = signal(false);
/** 0..1 while the first scene loads. */
export const loadProgress = signal(0);
/** WebGL could not start; only the fast route is available. */
export const noWebgl = signal(false);

export type LiftPhase = "idle" | "closing" | "moving" | "opening";
export const liftPhase = signal<LiftPhase>("idle");
export const liftFrom = signal<SceneId>("arrival");
export const liftTo = signal<SceneId>("arrival");
/** Floor selector is showing. */
export const liftPanel = signal(false);
/** Service / navigation drawer. */
export const menuOpen = signal(false);
export const contactOpen = signal(false);
/** About viewer: which wall is being inspected. */
export const viewer = signal<null | { kind: "certificates" | "registrations" | "partners" | "projects"; index: number }>(null);
/** Scope drawer for the current floor. */
export const scopeOpen = signal(false);
/** Rooftop ending: choice card, then the farewell fly-out. */
export const finale = signal<"none" | "choice" | "farewell">("none");
export const sound = signal(false);
/** Set when sustained low frame rate suggests the fast route would serve better. */
export const struggling = signal(false);
/** Visitor has moved at least once (hides the scroll hint). */
export const moved = signal(false);

export const currentFloor = computed(() => floorById(scene.value));
export const anyModal = computed(() => liftPanel.value || menuOpen.value || contactOpen.value || !!viewer.value || scopeOpen.value);

export function setLang(l: Lang) {
  lang.value = l;
  try {
    localStorage.setItem("fast-lang", l);
  } catch {
    /* private mode */
  }
}

export function setMode(m: Mode) {
  mode.value = m;
  const u = new URL(location.href);
  if (m === "lite") u.searchParams.set("view", "list");
  else u.searchParams.delete("view");
  history.replaceState(null, "", u);
}
