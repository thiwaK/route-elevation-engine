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
import { downloadGeoJSON } from "./utilities";
// import FeatureCollectionPBuffer from "arcgis-pbf-parser";

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

export function getEleveationAlongRoad(roadFC: any, contourFC: any) {
  const results = [];

  // const intersections = lineIntersect(roadFC, contourFC);
  // if (intersections.features.length > 0) {
  //   console.log("intersecting contour", intersections);
  // }

  for (const road of roadFC.features) {

    for (const contour of contourFC.features) {
      if (booleanIntersects(road, contour)) {

        const roadXY = road.geometry.coordinates
        const contourVal = contour.properties
        results.push({
          roadXY,
          contourVal,
        });
      }
    }
  }

  return results;
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

    for (let j = 0; j < layer.length; j++) {
      const feature = layer.feature(j);
      const geojsonFeature = feature.toGeoJSON(x, y, z);
      //   console.log("feature", feature);
      //   console.log("feature json", geojsonFeature)
      features.push(geojsonFeature);
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
