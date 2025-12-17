"use client";

import { CircleMarker, Polyline, useMap } from "react-leaflet";
import { useRouteStore } from "@/lib/stores/routeStore";
import vectorTileStyling from "@/lib/layerStyling";
import { useMapboxVectorLayer } from "@/hooks/useMapboxVectorLayer";

type Props = { url?: string };

export function TransitLayer({ url }: Props) {
  const addPoint = useRouteStore((s) => s.addPoint);
  const points = useRouteStore((s) => s.points);
  const segment = useRouteStore((s) => s.segment);
  const map = useMap();

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const effectiveUrl =
    url ??
    `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;

  useMapboxVectorLayer(
    map,
    effectiveUrl,
    { vectorTileLayerStyles: vectorTileStyling, token: accessToken },
    (e: any) => {
      const { latlng } = e;
      if (latlng) addPoint([latlng.lat, latlng.lng]);
    }
  );

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