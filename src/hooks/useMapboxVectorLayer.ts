"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet.vectorgrid";
import type { Map as LeafletMap } from "leaflet";

type Options = {
  urlTemplate: string;
  vectorTileLayerStyles?: any;
  token?: string;
  subdomains?: string;
  maxZoom?: number;
  interactive?: boolean;
};

export function createMapboxVectorLayer(
  urlTemplate: string,
  opts: Options = {}
) {
  // Factory used for testing or non-hook usage
  return (L as any).vectorGrid.protobuf(urlTemplate, {
    vectorTileLayerStyles: opts.vectorTileLayerStyles,
    attribution: "© OpenStreetMap contributors, © MapBox",
    token: opts.token,
    subdomains: opts.subdomains || "abcd",
    interactive: opts.interactive ?? true,
    maxZoom: opts.maxZoom ?? 18,
  });
}

export function useMapboxVectorLayer(
  map: LeafletMap | null | undefined,
  urlTemplate: string | null | undefined,
  opts: Options = {},
  onClick?: (e: any) => void
) {
  useEffect(() => {
    if (!map || !urlTemplate) return;
    const layer = createMapboxVectorLayer(urlTemplate, opts).addTo(map);
    if (onClick) layer.on("click", onClick);
    return () => {
      if (onClick) layer.off("click", onClick);
      try {
        map.removeLayer(layer);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, urlTemplate]);
}
