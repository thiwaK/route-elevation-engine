"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import { useRouteStore } from "@/lib/stores/routeStore";
import {
  bboxCenterFromCoords,
  maxDistanceFromCenterToBbox,
} from "@/lib/utils/geo";
import type { LatLngTuple } from "leaflet";

async function segmentRadius() {
  const roadSegment = useRouteStore((s) => s.segment);
  const center = bboxCenterFromCoords(roadSegment as LatLngTuple[]);
  const { center: c2, maxDistanceMeters } = maxDistanceFromCenterToBbox(
    roadSegment as LatLngTuple[]
  );
  return { center, maxDistanceMeters };
}

async function contourURL() {
const { center, maxDistanceMeters } = await segmentRadius();
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const effectiveUrl = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${center[0]},${center[1]}.json?layers=contour&radius=${maxDistanceMeters}&limit=50&access_token=${accessToken}`;

  return { effectiveUrl };
}

export async function ContourLayer() {
  const effectiveUrl = await contourURL();

  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const layer = (L as any).vectorGrid.protobuf(effectiveUrl, {
      maxZoom: 18,
      vectorTileLayerStyles: {
        primary: { color: "#512C02FF", weight: 2, opacity: 0.5 },
        primary_link: { color: "#512C02FF", weight: 2, opacity: 0.5 },
      },
    });

    layer.addTo(map);
    return () => void map.removeLayer(layer);
  }, [map, effectiveUrl]);

  return null;
}
