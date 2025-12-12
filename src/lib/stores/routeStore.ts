import { create } from "zustand";

type RouteStore = {
  points: [number, number][];
  segment: [number, number][] | null;

  setPoints: (pts: [number, number][]) => void;
  addPoint: (pt: [number, number]) => void;
  setSegment: (seg: [number, number][] | null) => void;
  clear: () => void;
};

export const useRouteStore = create<RouteStore>((set) => ({
  points: [],
  segment: null,

  setPoints: (pts) => set({ points: pts }),
  addPoint: (pt) => set((s) => ({ points: [...s.points, pt] })),
  setSegment: (seg) => set({ segment: seg }),
  clear: () => set({ points: [], segment: null }),
}));
