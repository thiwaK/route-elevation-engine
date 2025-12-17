"use client";

import { useEffect, useState } from "react";
import type { LatLngTuple } from "leaflet";
import {
  bboxCenterFromCoords,
  maxDistanceFromCenterToBbox,
} from "@/lib/utils/geo";

export function useContourTileQuery(roadSegment?: LatLngTuple[] | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!roadSegment || roadSegment.length === 0) {
      setUrl(null);
      return;
    }
    const center = bboxCenterFromCoords(roadSegment);
    const { center: c2, maxDistanceMeters } =
      maxDistanceFromCenterToBbox(roadSegment);
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!accessToken) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN not set; contour disabled");
      setUrl(null);
      return;
    }
    const effectiveUrl = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${center[0]},${center[1]}.json?layers=contour&radius=${maxDistanceMeters}&limit=50&access&token=${accessToken}`;
    setUrl(effectiveUrl);
  }, [JSON.stringify(roadSegment)]);

  return { url };
}
