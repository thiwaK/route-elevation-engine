"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

type ContourLayerProps = {
  lat: Number;
  long: Number;
};

export function ContourLayer({ lat, long }: ContourLayerProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const effectiveUrl = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${long},${lat}.json?layers=contour&limit=50&access_token=${accessToken}`;

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
