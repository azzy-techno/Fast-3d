import { create } from "zustand";
import type { AboutPanel } from "./data/about";
export const useTour = create<{
  progress: number;
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
