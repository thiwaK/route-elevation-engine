"use client";

import { CircleMarker, useMap} from "react-leaflet";
import vectorTileStyling from "@/lib/layerStyling";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.vectorgrid";
import { Storage } from "@/lib/stores/storeApi";

export function TransitLayer() {
  const { addPoint, points } = Storage();
  const map = useMap();

  const onAddPoint = (e: any) => {
    const { latlng } = e;
    if (latlng) addPoint([latlng.lat, latlng.lng]);
  };
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const effectiveUrl = `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;

  useEffect(() => {
    if (!map || !effectiveUrl) return;

    const layer = (L as any).vectorGrid.protobuf(effectiveUrl, {
      vectorTileLayerStyles: vectorTileStyling,
      attribution: "© OpenStreetMap contributors, © MapBox",
      token: accessToken,
      subdomains: "abcd",
      interactive: true,
      maxZoom: 18,
    });
    layer.addTo(map);

    layer.on("click", onAddPoint);
    return () => {
      layer.off("click", onAddPoint);
      try {
        map.removeLayer(layer);
      } catch {}
    };
  }, [map, effectiveUrl]); // if map or url changes, re-render the map

  return (
    <>
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={p}
          radius={6}
          pathOptions={{
            color: "#EF1F1FFF",
            fillColor: "#EF1F1FFF",
            fillOpacity: 1,
          }}
        />
      ))}
      {/* {segment && } */}
    </>
  );
}
