import type { LatLngTuple } from "leaflet";

/**
 * Compute bounding box [minLat, minLng, maxLat, maxLng] from an array of [lat, lng] pairs.
 */
export function bboxFromCoords(coords: LatLngTuple[]) {
  if (coords.length === 0) throw new Error("coords empty");
  let minLat = Infinity,
    minLng = Infinity,
    maxLat = -Infinity,
    maxLng = -Infinity;
  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, minLng, maxLat, maxLng };
}

/**
 * Get center point [lat, lng] of a bbox (rect) given either coords array or bbox object.
 */
export function bboxCenterFromCoords(coords: LatLngTuple[]) {
  const { minLat, minLng, maxLat, maxLng } = bboxFromCoords(coords);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  return [centerLat, centerLng] as LatLngTuple;
}

/**
 * Haversine distance between two [lat, lng] points in meters.
 */
export function haversineDistance(a: LatLngTuple, b: LatLngTuple) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng),
      Math.sqrt(1 - (sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng))
    );
  return R * c;
}

/**
 * Max distance (meters) from bbox center to bbox corners (or optionally to all coords).
 * By default computes distance to the 4 bbox corners and returns the maximum.
 */
export function maxDistanceFromCenterToBbox(coords: LatLngTuple[]) {
  const { minLat, minLng, maxLat, maxLng } = bboxFromCoords(coords);
  const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2] as LatLngTuple;
  const corners: LatLngTuple[] = [
    [minLat, minLng],
    [minLat, maxLng],
    [maxLat, minLng],
    [maxLat, maxLng],
  ];
  let max = 0;
  for (const c of corners) {
    const d = haversineDistance(center, c);
    if (d > max) max = d;
  }
  return { center, maxDistanceMeters: max };
}

