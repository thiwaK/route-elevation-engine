"use client";

import { useMap } from "react-leaflet";
import { useRouteStore } from "@/lib/stores/routeStore";
import { useContourTileQuery } from "@/hooks/useContourTileQuery";
import { useMapboxVectorLayer } from "@/hooks/useMapboxVectorLayer";

export function ContourLayer() {
  const map = useMap();
  const roadSegment = useRouteStore((s) => s.segment);
  const { url } = useContourTileQuery(roadSegment);

  useMapboxVectorLayer(map, url, {
    maxZoom: 18,
    vectorTileLayerStyles: {
      primary: { color: "#512C02FF", weight: 2, opacity: 0.5 },
      primary_link: { color: "#512C02FF", weight: 2, opacity: 0.5 },
    },
  });

  return null;
}

// {"type":"FeatureCollection","features":[{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[80.779576,7.710594]},"properties":{"ele":120,"index":2,"tilequery":{"distance":0,"geometry":"polygon","layer":"contour"}}},{"type":"Feature","id":2,"geometry":{"type":"Point","coordinates":[80.779576,7.710594]},"properties":{"ele":130,"index":1,"tilequery":{"distance":0,"geometry":"polygon","layer":"contour"}}},{"type":"Feature","id":3,"geometry":{"type":"Point","coordinates":[80.779576,7.710594]},"properties":{"ele":140,"index":2,"tilequery":{"distance":0,"geometry":"polygon","layer":"contour"}}}]}
