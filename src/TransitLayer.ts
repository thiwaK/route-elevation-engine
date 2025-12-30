import L from "leaflet";
import "leaflet.vectorgrid";
import tileStyling from "./TransitLayerStyling";
import { Storage } from "./StorageAPI";

const accessToken =
  "pk.eyJ1IjoicHJvaWN0IiwiYSI6ImNsdDQ2bWJ0cjBiN24ycXBzY2F0aHgwNnYifQ.aen9m87FEaN8hEpQC5IN9A";
const transitLayerURL = `https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token={token}`;
const routeSegmentLayerURL = `https://api.mapbox.com/directions/v5/mapbox/driving/{coords}?geometries=geojson&overview=full&access_token={token}`;

let map: L.Map;
export let markerArray: L.CircleMarker[] = [];
export const storage = Storage();

let markerIndex = 0;
function addCircleMarker(latlng: L.LatLngExpression) {
  var circleMarker = L.circleMarker(latlng, {
    radius: 6,
    color: "#EF1F1FFF",
    fillColor: "#EF1F1FFF",
    fillOpacity: 0.8,
    weight: 2,
  }).addTo(map);

  circleMarker.bindPopup(`I am a circle marker ${markerIndex}`);
  markerIndex += 1;

  return circleMarker;
}

function onAddPointTransit(e: any) {
  const { latlng } = e;
  if (latlng) {
    storage.addPoint([latlng.lat, latlng.lng]);
    const marker = addCircleMarker(latlng as L.LatLngExpression);
    markerArray.push(marker);
  }
}

type Remove = () => void;
export function addRoutes(mapObj: L.Map): Remove {
  map = mapObj;
  const layer = (L as any).vectorGrid.protobuf(transitLayerURL, {
    vectorTileLayerStyles: tileStyling,
    token: accessToken,
    subdomains: "abcd",
    interactive: true,
    maxZoom: 18,
    unit: "metric",
  });

  layer.addTo(map);
  layer.on("click", onAddPointTransit);

  return () => {
    layer.remove();
    try {
      map.removeLayer(layer);
    } catch {}
  };
}

export function clearTransitMarkers() {
  markerArray.forEach((element) => {
    (element as L.CircleMarker).remove();
  });

  markerArray = [];
}

export async function getRoadSegement() {
  if (markerArray.length < 2) return null;

  const coords = markerArray
    .map((p) => {
      const ll = p.getLatLng();
      return `${ll.lng},${ll.lat}`;
    })
    .join(";");

  const url = routeSegmentLayerURL
    .replace("{coords}", coords)
    .replace("{token}", accessToken);

  const res = await fetch(url);
  const data = await res.json();

  if (data.code != "Ok") throw new Error("Route segment featch failed");
  if (!data.routes || !data.routes[0]) return null;

  const route = data.routes[0];

  const geometry: [number, number][] = route.geometry.coordinates.map(
    (c: number[]) => [c[1], c[0]]
  );

  

  return {
    geometry,
    distance: route.distance, // meters
    duration: route.duration, // seconds
    raw: route,
  };
}

export function resampleSegment(
  polyline: L.Polyline,
  pointCount: number
): L.LatLng[] {
  const latlngs = polyline.getLatLngs() as L.LatLng[];

  if (latlngs.length < 2 || pointCount < 2) {
    return latlngs;
  }

  // Compute cumulative distances
  const distances: number[] = [0];
  let total = 0;

  for (let i = 1; i < latlngs.length; i++) {
    total += latlngs[i - 1].distanceTo(latlngs[i]);
    distances.push(total);
  }

  const step = total / (pointCount - 1);
  const result: L.LatLng[] = [latlngs[0]];

  let target = step;
  let seg = 1;

  for (let i = 1; i < pointCount - 1; i++) {
    while (distances[seg] < target) seg++;

    const p1 = latlngs[seg - 1];
    const p2 = latlngs[seg];

    const d1 = distances[seg - 1];
    const d2 = distances[seg];

    const t = (target - d1) / (d2 - d1);

    result.push(
      L.latLng(p1.lat + (p2.lat - p1.lat) * t, p1.lng + (p2.lng - p1.lng) * t)
    );

    target += step;
  }

  result.push(latlngs[latlngs.length - 1]);
  return result;
}