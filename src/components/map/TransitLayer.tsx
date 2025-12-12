"use client";

import { MapContainer, Marker, Popup, CircleMarker } from "react-leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

type TransitLayerProps = { url?: string };

if (!(L.DomEvent as any).fakeStop) {
  (L.DomEvent as any).fakeStop = function (e: Event | undefined) {
    e = e || window.event;
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
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

  const effectiveUrl =
    url ??
    `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;

  const map = useMap();

  useEffect(() => {
    if (!map) return;

    var vectorTileStyling = {
      admin: [],
      aeroway: [],
      airport_label: [],
      building: [],
      landuse_overlay: [],
      landuse: [],
      motorway_junction: [],
      natural_label: [],
      structure: [],
      transit_stop_label: [],
      water: [],
      waterway: [],
      road: function (properties: any, zoom: number) {
        var __class__ = properties.class;

        if (
          [
            "primary",
            "primary_link",
            "motorway",
            "motorway_link",
            "trunk",
            "trunk_link",
          ].includes(__class__)
        ) {
          return {
            weight: 2,
            fillColor: "#EF1F1FFF",
            color: "#EF1F1FFF",
            fillOpacity: 0,
            opacity: 0.8,
          };
        } else if (
          ["secondary", "secondary_link"].includes(__class__) &&
          zoom >= 10
        ) {
          return {
            weight: 2,
            fillColor: "#EFB113FF",
            color: "#EFB113FF",
            fillOpacity: 0,
            opacity: 0.8,
          };
        } else if (
          ["tertiary_link", "tertiary"].includes(__class__) &&
          zoom >= 12
        ) {
          return {
            weight: 2,
            dashArray: "2, 6",
            fillColor: "#B5AC97FF",
            color: "#B5AC97FF",
            fillOpacity: 0,
            opacity: 0.8,
          };
        } else if (
          [
            "street",
            "street_limited",
            "pedestrian",
            "track",
            "service",
            "path",
          ].includes(__class__) &&
          zoom >= 15
        ) {
          return {
            weight: 1,
            dashArray: "2, 10",
            fillColor: "#B5AC97FF",
            color: "#B5AC97FF",
            fillOpacity: 0,
            opacity: 0.8,
          };
        } else {
          return [];
        }
      },

      // Do not symbolize some stuff for mapbox
      country_label: [],
      marine_label: [],
      state_label: [],
      place_label: [],
      waterway_label: [],
      poi_label: [],
      road_label: [],
      housenum_label: [],

      // Do not symbolize some stuff for openmaptiles
      country_name: [],
      marine_name: [],
      state_name: [],
      place_name: [],
      waterway_name: [],
      poi_name: [],
      road_name: [],
      housenum_name: [],
    };

    var mapboxVectorTileOptions = {
      rendererFactory: (L as any).canvas.tile,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.mapbox.com/about/maps/">MapBox</a>',
      vectorTileLayerStyles: vectorTileStyling,
      token: accessToken,
      subdomains: "abcd",
      interactive: true,
      //   pane: "OverlayPane",
      maxZoom: 18,
      getFeatureId: (feature: any) =>
        feature.id ?? Math.random().toString(36).slice(2),
    };

    const layer = (L as any).vectorGrid
      .protobuf(effectiveUrl, mapboxVectorTileOptions)
      .addTo(map);

    const ctrl = L.control
      .layers({ "MapBox Vector Tiles": layer }, {}, { collapsed: true })
      .addTo(map);

    layer.on("click", (e: any) => {
      // e.latlng is available for vectorGrid feature events (lat, lng)
      const { latlng } = e;
      if (latlng) {
        setPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
      }
      // optionally highlight clicked feature
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
          center={p}
          radius={6}
          pathOptions={{
            color: "#e74c3c",
            fillColor: "#e74c3c",
            fillOpacity: 1,
          }}
        >
          <Popup>Point {i + 1}</Popup>
        </CircleMarker>
      ))}
    </>
  );
}
