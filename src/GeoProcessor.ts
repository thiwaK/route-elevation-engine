import { VectorTile } from "@mapbox/vector-tile";
import Pbf from "pbf";
// import tilebelt from "@mapbox/tilebelt";
import * as turf from "@turf/turf";
import L from "leaflet";
import type { GeoJsonObject, FeatureCollection, Feature, Geometry } from "geojson";
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

function tilePointToLngLat(
  x: number,
  y: number,
  z: number,
  extent: number,
  px: number,
  py: number
): [number, number] {
  const n = Math.pow(2, z);
  const lng = ((x + px / extent) / n) * 360 - 180;

  const latRad = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * (y + py / extent)) / n))
  );

  return [lng, (latRad * 180) / Math.PI];
}

function decodeVectorTile(arrayBuffer: ArrayBuffer): VectorTile {
    console.log(arrayBuffer)
  return new VectorTile(new Pbf(arrayBuffer));
}

function vtFeatureToGeoJSON(
  feature: any,
  tileX: number,
  tileY: number,
  tileZ: number,
  extent = 4096
) {
  const geom = feature.loadGeometry();
  const coordinates: any[] = [];

  for (const ring of geom) {
    const line: number[][] = [];
    for (const p of ring) {
      line.push(tilePointToLngLat(tileX, tileY, tileZ, extent, p.x, p.y));
    }
    coordinates.push(line);
  }

  return {
    type: "Feature",
    geometry: {
      type:
        feature.type === 1
          ? "Point"
          : feature.type === 2
          ? "LineString"
          : "Polygon",
      coordinates: feature.type === 3 ? coordinates : coordinates[0],
    },
    properties: feature.properties,
  };
}

export function mergeTiles(
  tiles: {
    x: number;
    y: number;
    z: number;
    data: ArrayBuffer;
  }[],
  layerName: string
) {
  const features: any[] = [];

  for (const tile of tiles) {
    const vt = decodeVectorTile(tile.data);
    const layer = vt.layers[layerName];
    if (!layer) continue;

    for (let i = 0; i < layer.length; i++) {
      const f = layer.feature(i);
      features.push(
        vtFeatureToGeoJSON(f, tile.x, tile.y, tile.z, layer.extent)
      );
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}



export function swapCoords(feature: Feature): Feature {
  const geom = feature.geometry;

  if (geom.type === "Point") {
    geom.coordinates = [geom.coordinates[1], geom.coordinates[0]];
  } else if (geom.type === "LineString") {
    geom.coordinates = (geom.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng]
    );
  } else if (geom.type === "Polygon") {
    geom.coordinates = (geom.coordinates as [number, number][][]).map(ring =>
      ring.map(([lng, lat]) => [lat, lng])
    );
  }

  return feature;
}


export function processPBF(pbfArray: any[], layerName: string) {
  const features: any[] = [];

  for (let i = 0; i < pbfArray.length; i++) {
    const { data: dbf, x: x, y: y, z: z } = pbfArray[i];
    const vTile = decodeVectorTile(dbf);
    const layer = vTile.layers[layerName];
    console.log(vTile)
    console.log(layer)

    if (!layer) continue;

    for (let j = 0; j < layer.length; j++) {
      const f = layer.feature(j);
      console.log(f)
      features.push(vtFeatureToGeoJSON(f, x, y, z, layer.extent));
    }
  }

  const geojson: FeatureCollection  = {
    type: "FeatureCollection",
    features: features
  };

  return geojson;
}
