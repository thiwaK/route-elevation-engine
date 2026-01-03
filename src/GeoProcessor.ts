import { VectorTile } from "@mapbox/vector-tile";
import Pbf from "pbf";
import * as turf from "@turf/turf";
import type {
  GeoJsonObject,
  FeatureCollection,
  Feature,
  Geometry,
  LineString,
  Polygon,
  Point,
} from "geojson";

import booleanIntersects from "@turf/boolean-intersects";
import lineIntersect from "@turf/line-intersect";
import length from "@turf/length";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { downloadGeoJSON } from "./utilities";
import polygonToLine from "@turf/polygon-to-line";
import { lineString } from "@turf/helpers";
import bbox from "@turf/bbox";
import type { BBox } from "geojson";

function latLngToTileXY(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const n = Math.pow(2, zoom);

  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log((1 + sinLat) / (1 - sinLat)) / (2 * Math.PI)) * n) / 2
  );

  return { x, y };
}

export function getTilesInBounds(boundingBox: BBox, zoom: number) {
  const [minLng, minLat, maxLng, maxLat] = boundingBox;
  const sw = latLngToTileXY(minLat, minLng, zoom);
  const ne = latLngToTileXY(maxLat, maxLng, zoom);

  const tiles: { x: number; y: number; z: number }[] = [];

  const minX = Math.min(sw.x, ne.x);
  const maxX = Math.max(sw.x, ne.x);
  const minY = Math.min(sw.y, ne.y);
  const maxY = Math.max(sw.y, ne.y);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ x, y, z: zoom });
    }
  }

  return tiles;
}

export function samplePolyline(
  polyline: GeoJSON.Feature<GeoJSON.LineString>,
  dataset: GeoJSON.FeatureCollection
) {
  const results: any[] = [];

  for (const feature of dataset.features) {
    const intersect = turf.lineIntersect(polyline, feature as any);

    if (intersect.features.length > 0) {
      results.push({
        featureProps: feature.properties,
        intersections: intersect.features,
      });
    }
  }

  return results;
}

export function getElevationAlongRoad(
  roadFC: FeatureCollection<LineString>,
  contourFC: any
) {
  const intersections = [];

  // contourFC.features.forEach(
  //   (f: { geometry: { type: any; coordinates: any } }, i: any) => {
  //     console.log(i, f.geometry.type, f.geometry.coordinates);
  //   }
  // );

  console.log("roadFC", roadFC);
  for (const contour of contourFC.features) {
    const pts = lineIntersect(roadFC, contour);
    intersections.push({ point:pts, contour });
  }

  return intersections;

  // const results: { distance: number; elevation: number }[] = [];

  // for (const road of roadFC.features) {
  //   if (
  //     road.geometry.type !== "LineString" &&
  //     road.geometry.type !== "MultiLineString"
  //   )
  //     continue;

  //   for (const pt of intersections.features) {
  //     const snapped = nearestPointOnLine(road, pt.geometry.coordinates);

  //     results.push({
  //       distance: snapped.properties.location,
  //       elevation: pt.properties!.ele, // elevation on polygon
  //     });
  //   }
  // }

  // return results.sort((a, b) => a.distance - b.distance);
}

function isValidRing(ring: number[][]) {
  if (!Array.isArray(ring) || ring.length < 4) return false;

  const first = ring[0];
  const last = ring[ring.length - 1];

  // must be closed
  if (first[0] !== last[0] || first[1] !== last[1]) return false;

  // no NaNs
  for (const c of ring) {
    if (!isFinite(c[0]) || !isFinite(c[1])) return false;
  }

  return true;
}

export function contoursToLines(contourFC: any) {
  const lines = [];

  for (const f of contourFC.features) {
    const g = f.geometry;
    if (!g) continue;

    if (g.type === "Polygon") {
      for (const ring of g.coordinates) {
        if (isValidRing(ring)) {
          lines.push(lineString(ring, f.properties));
        }
      }
    }

    if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) {
        for (const ring of poly) {
          if (isValidRing(ring)) {
            lines.push(lineString(ring, f.properties));
          }
        }
      }
    }
  }

  return {
    type: "FeatureCollection",
    features: lines,
  };
}

function sanitizeGeometry(feature: any) {
  const g = feature.geometry;
  if (!g) return null;

  // ---- POLYGON ----
  if (g.type === "Polygon") {
    const rings = g.coordinates.filter(isValidRing);
    if (rings.length === 0) return null;

    return {
      ...feature,
      geometry: { type: "Polygon", coordinates: rings },
    };
  }

  // ---- MULTIPOLYGON ----
  if (g.type === "MultiPolygon") {
    const polys = g.coordinates
      .map((poly: number[][][]) => poly.filter(isValidRing))
      .filter((poly: number[][][]) => poly.length > 0);

    if (polys.length === 0) return null;

    // downgrade single polygon multipolys
    if (polys.length === 1) {
      return {
        ...feature,
        geometry: { type: "Polygon", coordinates: polys[0] },
      };
    }

    return {
      ...feature,
      geometry: { type: "MultiPolygon", coordinates: polys },
    };
  }

  // ---- PASS THROUGH ----
  return feature;
}

export function processPBF(pbfArray: any[], layerName: string) {
  const features: any[] = [];

  for (let i = 0; i < pbfArray.length; i++) {
    const { data: rawPbf, x: x, y: y, z: z } = pbfArray[i];
    const pbf = new Pbf(new Uint8Array(rawPbf));
    const vTile = new VectorTile(pbf);
    const layer = vTile.layers[layerName];
    // console.log("vTile", vTile);
    // console.log("layer", layer);

    if (!layer) continue;
    // console.log("feature count", layer.length)
    // console.log("extent", layer.extent)

    for (let i = 0; i < layer.length; i++) {
      const geojson = layer.feature(i).toGeoJSON(x, y, z);
      const clean = sanitizeGeometry(geojson);
      if (clean) features.push(clean);
    }
  }

  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: features,
  };

  return geojson;
}

type XY = [number, number];
export function xyArrayToGeojson(
  array: Array<XY>,
  swapXY = true
): FeatureCollection<Point> {
  const featureCollection: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: array.map<Feature<Point>>((coord, i) => {
      const coordinates: [number, number] = swapXY
        ? [coord[1], coord[0]]
        : coord;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates,
        },
        properties: { id: i },
      };
    }),
  };

  return featureCollection;
}

export function geojsonToXYArray(
  fc: FeatureCollection,
  swapXY = true
): Array<XY> {
  const out: Array<XY> = [];
  for (const feature of fc.features) {
    if (!feature || !feature.geometry) continue;

    const geom = feature.geometry;
    if (geom.type === "Point") {
      const coords = geom.coordinates as unknown as [number, number];
      out.push(swapXY ? [coords[1], coords[0]] : coords);
    } else if (geom.type === "MultiPoint") {
      for (const c of geom.coordinates as [number, number][]) {
        out.push(swapXY ? [c[1], c[0]] : c);
      }
    } else if (geom.type === "LineString") {
      for (const c of geom.coordinates as [number, number][]) {
        out.push(swapXY ? [c[1], c[0]] : c);
      }
    } else if (geom.type === "MultiLineString" || geom.type === "Polygon") {
      // flatten one level of arrays (handles rings for Polygon too)
      for (const part of geom.coordinates as any[]) {
        for (const c of part as [number, number][]) {
          out.push(swapXY ? [c[1], c[0]] : c);
        }
      }
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates as any[]) {
        for (const ring of poly) {
          for (const c of ring as [number, number][]) {
            out.push(swapXY ? [c[1], c[0]] : c);
          }
        }
      }
    }
    // ignore GeometryCollection or unknown types; extend if needed
  }

  return out;
}

export function distanceBetweenPoints(
  coordinateA: number[],
  coordinateB: number[]
) {
  const earthRadius = 6371;
  const dLat = ((coordinateB[0] - coordinateA[0]) * Math.PI) / 180;
  const dLon = ((coordinateB[1] - coordinateA[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coordinateA[0] * Math.PI) / 180) *
      Math.cos((coordinateB[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c * 1000;

  return distance;
}
