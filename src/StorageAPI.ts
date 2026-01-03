import { routeStore } from "./Strage";
import type { FeatureCollection, LineString } from "geojson";

export function Storage() {
  return {
    savePoint: (pt: [number, number]) => routeStore.getState().addPoint(pt),

    savePoints: (pts: [number, number][]) =>
      routeStore.getState().setPoints(pts),

    saveSegment: (seg: FeatureCollection<LineString> | null) =>
      routeStore.getState().setRoadSegment(seg),

    saveContours: (seg: FeatureCollection | null) =>
      routeStore.getState().setContour(seg),

    clear: () => routeStore.getState().clear(),

    // Always fresh state via getters
    get points() {
      return routeStore.getState().points;
    },

    get roadSegment() {
      return routeStore.getState().roadSegment;
    },

    get contours() {
      return routeStore.getState().contour;
    },

    get listener() {
      return routeStore.subscribe;
    },
  };
}
