"use client";

import {
  MapContainer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
} from "react-leaflet";
import { useEffect, useState, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import "@/lib/layerStyling";
import { roadSegment } from "@/lib/roadSegment";
import { formatTime, formatDistance } from "@/lib/utils/formatters";

type TransitLayerProps = { url?: string };

if (!(L.DomEvent as any).fakeStop) {
  (L.DomEvent as any).fakeStop = function (e: Event | undefined) {
    e = e || window.event;
    if (e) {
      e.stopPropagation?.();
      e.preventDefault?.();
      e.cancelBubble = true;
      e.returnValue = false;
    }
    return e;
  };
}

export function numberedDivIcon(n: number) {
  return L.divIcon({
    className: "numbered-dot-marker",
    html: `<div class="dot-marker">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function TransitLayer({ url }: TransitLayerProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  if (!accessToken) throw new Error("MAPBOX_TOKEN is required");

  const [points, setPoints] = useState<[number, number][]>([]);
  const [segment, setSegment] = useState<[number, number][] | null>(null);

  const map = useMap();

  const effectiveUrl =
    url ??
    `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;

  const updateSegment = useCallback(async () => {
    if (points.length < 2) {
      setSegment(null);
      return;
    }
    const seg = await roadSegment(points, accessToken);
    if (seg) {
      console.log("distance:", formatDistance(seg.distance));
      console.log("duration:", formatTime(seg.duration));

      setSegment(seg.geometry);
    }
  }, [points, accessToken]);

  useEffect(() => {
    updateSegment();
  }, [updateSegment]);

  useEffect(() => {
    if (!map) return;

    const layer = (L as any).vectorGrid
      .protobuf(effectiveUrl, {
        rendererFactory: (L as any).canvas.tile,
        vectorTileLayerStyles: vectorTileStyling,
        attribution: "&copy; OpenStreetMap contributors, &copy; MapBox",
        token: accessToken,
        subdomains: "abcd",
        interactive: true,
        maxZoom: 18,
      })
      .addTo(map);

    const ctrl = L.control
      .layers({ "Mapbox Vector Tiles": layer }, {}, { collapsed: true })
      .addTo(map);

    layer.on("click", (e: any) => {
      const { latlng } = e;
      if (latlng) {
        setPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
      }

      if (e.layer && e.layer.setStyle) {
        const original = e.layer.options && e.layer.options.style;
        e.layer.setStyle?.({ color: "#ff0", weight: 3 });
        setTimeout(() => e.layer.setStyle?.(original), 300);
      }
    });

    return () => {
      ctrl.remove();
      map.removeLayer(layer);
    };
  }, [map, effectiveUrl, accessToken]);

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
        >
          <Popup>Point {i + 1}</Popup>
        </CircleMarker>
      ))}

      {segment && <Polyline positions={segment} weight={4} color="#00A2FF" />}
    </>
  );
}
