"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

type TransitLayerProps = { url?: string };

export function TransitLayer({ url }: TransitLayerProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const effectiveUrl =
    url && url.length > 0
      ? url
      : `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token=${accessToken}`;

  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const layer = (L as any).vectorGrid.protobuf(effectiveUrl, {
      maxZoom: 18,
      vectorTileLayerStyles: {
        primary: { color: "#ff3333", weight: 2, opacity:0.5 },
        primary_link: { color: "#ff3333", weight: 2, opacity:0.5 },
      },
    });

    layer.addTo(map);
    return () => void map.removeLayer(layer);
  }, [map, effectiveUrl]);

  return null;
}
