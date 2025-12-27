import { useRouteStore } from "@/lib/stores/routeStore";

export function Storage() {
  const addPoint = useRouteStore((s) => s.addPoint);
  const setSegment = useRouteStore((s) => s.setSegment);
  const points = useRouteStore((s) => s.points);
  const segment = useRouteStore((s) => s.segment);
  

  return {
    addPoint,
    points,
    segment,
    setSegment
  };
}