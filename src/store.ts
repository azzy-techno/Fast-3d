import { create } from "zustand";
import type { AboutPanel } from "./data/about";
export const useTour = create<{
  progress: number;
  observatoryOpen: boolean;
  observatoryPending: boolean;
  beginObservatory: () => void;
  setObservatory: (open: boolean) => void;
  aboutPanel: AboutPanel | null;
  aboutPartner: string;
  setAboutPartner: (id: string) => void;
  setAboutPanel: (panel: AboutPanel | null) => void;
  active: number;
  jumpVersion: number;
  liftRequest: number;
  requestLift: () => void;
  teleport: (progress: number) => void;
  setProgress: (progress: number) => void;
}>((set) => ({
  progress: 0,
  observatoryOpen: false,
  observatoryPending: false,
  beginObservatory: () => set({ observatoryPending: true }),
  setObservatory: (observatoryOpen) =>
    set({ observatoryOpen, observatoryPending: false }),
  aboutPanel: null,
  aboutPartner: "meta-smart-factory",
  setAboutPartner: (aboutPartner) => set({ aboutPartner }),
  setAboutPanel: (aboutPanel) => set({ aboutPanel }),
  active: 0,
  jumpVersion: 0,
  liftRequest: 0,
  requestLift: () => set((s) => ({ liftRequest: s.liftRequest + 1 })),
  teleport: (progress) =>
    set((s) => ({
      progress,
      active: Math.max(0, Math.min(12, Math.floor(progress + 0.1))),
      jumpVersion: s.jumpVersion + 1,
    })),
  setProgress: (progress) =>
    set({
      progress,
      active: Math.max(0, Math.min(12, Math.floor(progress + 0.1))),
    }),
}));
