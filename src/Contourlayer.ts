import L from "leaflet";
import "leaflet.vectorgrid";
import tileStyling from "./ContourLayerStyling";

const accessToken =
  "pk.eyJ1IjoicHJvaWN0IiwiYSI6ImNsdDQ2bWJ0cjBiN24ycXBzY2F0aHgwNnYifQ.aen9m87FEaN8hEpQC5IN9A";

interface TilequeryFeature {
  id: string;
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface TilequeryResult {
  features: TilequeryFeature[];
}

const TILEQUERY_BASE =
  "https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/{z}/{x}/{y}.vector.pbf?access_token=" +
  accessToken;

function buildTileUrl(x: number, y: number, z: number) {
  return `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/${z}/${x}/${y}.vector.pbf?access_token=pk.eyJ1IjoicHJvaWN0IiwiYSI6ImNsdDQ2bWJ0cjBiN24ycXBzY2F0aHgwNnYifQ.aen9m87FEaN8hEpQC5IN9A`;
}

async function fetchTile(x: number, y: number, z: number) {
  const url = buildTileUrl(x, y, z);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Tile fetch failed ${z}/${x}/${y}`);
  }

  return {
    "x":x,
    "y":y,
    "z":z,
    "data": await res.arrayBuffer(),
  };
}

/**
 * Query Mapbox Tilequery for a single point with radius
 * @param point L.LatLngTuple (lng, lat)
 * @param radiusMeters radius in meters around the point
 * @param layers optional array of layer names to filter
 * @returns Array of features within radius
 */
export async function fetchTiles(
  tiles: { x: number; y: number; z: number }[],
  options?: {
    concurrency?: number;
    onProgress?: (done: number, total: number) => void;
  }
) {
  const concurrency = options?.concurrency ?? 6;

  const results: any[] = [];
  let index = 0;
  let completed = 0;

  async function worker() {
    while (index < tiles.length) {
      const current = tiles[index++];
      try {
        const tile = await fetchTile(current.x, current.y, current.z);
        results.push(tile);
      } catch (err) {
        console.error(err);
      } finally {
        completed++;
        options?.onProgress?.(completed, tiles.length);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);

  return results;
}

type Remove = () => void;
let map: L.Map;
export function addContours(mapObj: L.Map, bbox: L.LatLngBounds): Remove {
  map = mapObj;
  const layer = (L as any).vectorGrid.protobuf(TILEQUERY_BASE, {
    token: accessToken,
    vectorTileLayerStyles: tileStyling,
    subdomains: "abcd",
    interactive: true,
    maxZoom: 18,
    unit: "metric",
    maxBounds: bbox,
    bounds: bbox,
    noWrap: true,
    maxBoundsViscosity: 1.0, // hard lock
  });

  layer.addTo(map);

  return () => {
    layer.remove();
    try {
      map.removeLayer(layer);
    } catch {}
  };
}
