import { create } from "zustand";
export const useTour = create<{
  progress: number;
  active: number;
  setProgress: (progress: number) => void;
}>((set) => ({
  progress: 0,
  active: 0,
  setProgress: (progress) =>
    set({ progress, active: Math.max(0, Math.min(12, Math.round(progress))) }),
}));
