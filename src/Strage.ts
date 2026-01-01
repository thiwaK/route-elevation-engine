import { createStore } from "zustand/vanilla";
import type { FeatureCollection } from "geojson";

type RouteStore = {
  points: [number, number][];
  roadSegment: FeatureCollection | null;
  contour: FeatureCollection | null;

  setPoints: (pts: [number, number][]) => void;
  addPoint: (pt: [number, number]) => void;
  setRoadSegment: (seg: FeatureCollection | null) => void;
  clear: () => void;
  setContour: (seg: FeatureCollection | null) => void;
};

export const routeStore = createStore<RouteStore>((set) => ({
  points: [],
  roadSegment: null,
  contour: null,

  setPoints: (pts) => set({ points: pts }),

  addPoint: (pt) =>
    set((s) => ({ points: [...s.points, pt] })),

  setRoadSegment: (seg) => set({ roadSegment: seg }),

  clear: () => set({ points: [], roadSegment: null }),

  setContour: (cont) => set({ contour: cont }),
}));
