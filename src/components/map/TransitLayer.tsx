"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

type TransitLayerProps = { url?: string };

export function TransitLayer({ url }: TransitLayerProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  if (!accessToken) throw new Error("MAPBOX_TOKEN is required");

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
      road: function (properties: any) {
        var __class__ = properties.class;

        if (
          ["primary", "primary_link", "motorway", "motorway_link", "trunk", "trunk_link"].includes(__class__)
        ) {
          return {
            weight: 2,
            fillColor: "#EF1F1FFF",
            color: "#EF1F1FFF",
            fillOpacity: 0,
            opacity: 0.8,
          };
        } else if (["secondary", "secondary_link"].includes(__class__)) {
          return {
            weight: 2,
            fillColor: "#EFB113FF",
            color: "#EFB113FF",
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
    };

    const layer = (L as any).vectorGrid
      .protobuf(effectiveUrl, mapboxVectorTileOptions)
      .addTo(map);

    const ctrl = L.control
      .layers({ "MapBox Vector Tiles": layer }, {}, { collapsed: true })
      .addTo(map);

    return () => {
      ctrl.remove();
      map.removeLayer(layer);
    };
  }, [map, effectiveUrl, accessToken]);

  return null;
}
