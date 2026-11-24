import { EXTERIOR_ARRIVAL } from "./lib/journeyScroll";
import { create } from "zustand";
import type { AboutPanel } from "./data/about";
export type RoofWalk = "idle" | "toLift" | "landed" | "toExhibit";
export type LiftPhase =
  "idle" | "select" | "closing" | "travelling" | "opening";
export const useTour = create<{
  progress: number;
  roofWalk: RoofWalk;
  setRoofWalk: (state: RoofWalk) => void;
  liftPhase: LiftPhase;
  setLiftPhase: (phase: LiftPhase) => void;
  liftFrameReady: number;
  setLiftFrameReady: (version: number) => void;
  observatoryOpen: boolean;
  observatoryPending: boolean;
  beginObservatory: () => void;
  setObservatory: (open: boolean) => void;
  aboutPanel: AboutPanel | null;
  aboutPartner: string;
  setAboutPartner: (id: string) => void;
  setAboutPanel: (panel: AboutPanel | null) => void;
  jumpVersion: number;
  liftRequest: number;
  requestLift: () => void;
  teleport: (progress: number) => void;
  setProgress: (progress: number) => void;
}>((set) => ({
  progress: EXTERIOR_ARRIVAL,
  roofWalk: "idle",
  setRoofWalk: (roofWalk) => set({ roofWalk }),
  liftPhase: "idle",
  setLiftPhase: (liftPhase) => set({ liftPhase }),
  liftFrameReady: -1,
  setLiftFrameReady: (liftFrameReady) => set({ liftFrameReady }),
  observatoryOpen: false,
  observatoryPending: false,
  beginObservatory: () => set({ observatoryPending: true }),
  setObservatory: (observatoryOpen) =>
    set({ observatoryOpen, observatoryPending: false }),
  aboutPanel: null,
  aboutPartner: "meta-smart-factory",
  setAboutPartner: (aboutPartner) => set({ aboutPartner }),
  setAboutPanel: (aboutPanel) => set({ aboutPanel }),
  jumpVersion: 0,
  liftRequest: 0,
  requestLift: () => set((s) => ({ liftRequest: s.liftRequest + 1 })),
  teleport: (progress) =>
    set((s) => ({
      progress,
      jumpVersion: s.jumpVersion + 1,
      roofWalk: "idle",
    })),
  setProgress: (progress) =>
    set({
      progress,
    }),
}));
