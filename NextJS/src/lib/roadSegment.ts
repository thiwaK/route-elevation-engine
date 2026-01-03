export type RoadSegmentResult = {
  geometry: [number, number][]; // lat, lon pairs
  distance: number; // meters
  duration: number; // seconds
  raw: any; // entire route object
};

export async function roadSegment(
  points: [number, number][],
  token: string
): Promise<RoadSegmentResult | null> {
  if (points.length < 2) return null;

  const coords = points.map((p) => `${p[1]},${p[0]}`).join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes[0]) return null;

  const route = data.routes[0];

  const geometry: [number, number][] = route.geometry.coordinates.map(
    (c: number[]) => [c[1], c[0]]
  );

  return {
    geometry,
    distance: route.distance, // meters
    duration: route.duration, // seconds
    raw: route
  };
}
