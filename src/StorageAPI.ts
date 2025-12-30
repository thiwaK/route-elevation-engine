import { routeStore } from "./Strage";

export function Storage() {
  return {
    addPoint: (pt: [number, number]) =>
      routeStore.getState().addPoint(pt),

    setPoints: (pts: [number, number][]) =>
      routeStore.getState().setPoints(pts),

    setSegment: (seg: [number, number][] | null) =>
      routeStore.getState().setSegment(seg),

    setContour: (seg: [number, number][] | null) =>
      routeStore.getState().setContour(seg),

    clear: () =>
      routeStore.getState().clear(),

    // Always fresh state via getters
    get points() {
      return routeStore.getState().points;
    },

    get segment() {
      return routeStore.getState().segment;
    },

    get contour() {
      return routeStore.getState().contour;
    },

    get listener(){
      return routeStore.subscribe;
    }
    
  };
}
