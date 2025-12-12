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
import vectorTileStyling from "@/lib/layerStyling";

import { formatTime, formatDistance } from "@/lib/utils/formatters";
import { useRouteStore } from "@/lib/stores/routeStore";

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
  const addPoint = useRouteStore((s) => s.addPoint);
  const points = useRouteStore((s) => s.points);
  const segment = useRouteStore((s) => s.segment);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  if (!accessToken) throw new Error("MAPBOX_TOKEN is required");

  const map = useMap();

  const effectiveUrl =
    url ??
    `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;



  useEffect(() => {
    if (!map) return;

    const layer = (L as any).vectorGrid
      .protobuf(effectiveUrl, {
        // rendererFactory: (L as any).canvas.tile,
        vectorTileLayerStyles: vectorTileStyling,
        attribution: "&copy; OpenStreetMap contributors, &copy; MapBox",
        token: accessToken,
        subdomains: "abcd",
        interactive: true,
        maxZoom: 18,
      })
      .addTo(map);

    // const ctrl = L.control
    //   .layers({ "Mapbox Vector Tiles": layer }, {}, { collapsed: true })
    //   .addTo(map);

    layer.on("click", (e: any) => {
      const { latlng } = e;
      if (latlng) {
        // setPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
        addPoint([latlng.lat, latlng.lng]);
      }

      //   if (e.layer && e.layer.setStyle) {
      //     const original = e.layer.options && e.layer.options.style;
      //     e.layer.setStyle?.({ color: "#ff0", weight: 3 });
      //     setTimeout(() => e.layer.setStyle?.(original), 300);
      //   }
    });

    return () => {
      //   ctrl.remove();
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
