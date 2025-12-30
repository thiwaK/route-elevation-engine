export type Orientation = "vertical" | "horizontal";
type ResizeAxis = "x" | "y";
type ResizeEdge = "start" | "end";
type Cleanup = () => void;

let isVertical: boolean = true;
let isVisible: boolean = false;
let resizeHandlerX: any = null;
let resizeHandlerY: any = null;
let elevationProfileResizeHandlerContainer: HTMLDivElement;
let elevationProfileResizeHandler: HTMLDivElement;
let elevationProfileContainer: HTMLDivElement;

export const resizeOffsetPercentage: number = 10;
export const profileViewInitialOrientation: Orientation = "vertical";
export let profileViewInitialSize: number = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function registerProfileResizeHandler(
  handler: HTMLDivElement | null,
  container: HTMLDivElement | null
) {
  if (handler) elevationProfileResizeHandler = handler;
  if (container) elevationProfileContainer = container;

  if (isVertical) {
    if (resizeHandlerX != null) resizeHandlerX();

    resizeHandlerY = profileResizeHandler(
      elevationProfileResizeHandler,
      elevationProfileContainer,
      "y",
      "start"
    );
  } else {
    if (resizeHandlerY != null) resizeHandlerY();

    resizeHandlerX = profileResizeHandler(
      elevationProfileResizeHandler,
      elevationProfileContainer,
      "x",
      "end"
    );
  }
}

function profileResizeHandler(
  handler: HTMLDivElement,
  container: HTMLDivElement,
  axis: ResizeAxis,
  edge: ResizeEdge
): Cleanup {
  let startX = 0;
  let startY = 0;
  let startSize = 0;

  const MIN_SIZE = 200;

  const direction = edge === "end" ? 1 : -1;

  const onPointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;

    startSize = axis === "x" ? container.offsetWidth : container.offsetHeight;

    handler.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!handler.hasPointerCapture(e.pointerId)) return;

    const delta = axis === "x" ? e.clientX - startX : e.clientY - startY;

    const parent = container.parentElement;
    if (!parent) return;

    const maxSize = axis === "x" ? parent.clientWidth : parent.clientHeight;

    const newSize = Math.max(
      MIN_SIZE,
      Math.min(startSize + delta * direction, maxSize)
    );

    if (axis === "x") {
      container.style.width = `${newSize}px`;
    } else {
      container.style.height = `${newSize}px`;
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (handler.hasPointerCapture(e.pointerId)) {
      handler.releasePointerCapture(e.pointerId);
    }
  };

  handler.addEventListener("pointerdown", onPointerDown);
  handler.addEventListener("pointermove", onPointerMove);
  handler.addEventListener("pointerup", onPointerUp);

  return () => {
    handler.removeEventListener("pointerdown", onPointerDown);
    handler.removeEventListener("pointermove", onPointerMove);
    handler.removeEventListener("pointerup", onPointerUp);
  };
}

export function elevationProfileResizer(clientX: number, clientY: number) {
  if (isVertical) {
    // For vertical, anchored to bottom
    const newPercent = Math.max(
      resizeOffsetPercentage,
      Math.min(
        100 - resizeOffsetPercentage,
        ((window.innerHeight - clientY) / window.innerHeight) * 100
      )
    );
    profileViewInitialSize = newPercent;
  } else {
    // For horizontal, anchored to left
    const newPercent = Math.max(
      resizeOffsetPercentage,
      Math.min(
        100 - resizeOffsetPercentage,
        (clientX / window.innerWidth) * 100
      )
    );
    profileViewInitialSize = newPercent;
  }
}

export function registerOnClickListener(element: any, method: any) {
  if (element) {
    element.addEventListener("click", method);
  } else {
    throw new Error(
      `registerOnClickListener initialization failed ${element} ${method}`
    );
  }
}

export function updateElevationProfileOrientationIcon(
  button: HTMLButtonElement
) {
  const BiSolidDockLeft = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2zm-11 0V5h9l.002 14H10z"></path></svg>`;

  const BiSolidDockBottom = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 5l.001 9H5V5h14z"></path></svg>`;

  if (isVertical) {
    button.innerHTML = BiSolidDockLeft;
  } else {
    button.innerHTML = BiSolidDockBottom;
  }
}

export function toggleElevationProfileVisibility(
  elevationProfileContainer: HTMLDivElement
) {
  if (elevationProfileContainer) {
    isVisible = !isVisible;
  }
  return isVisible!;
}

export function updateElevationProfileResizeHandlerStyles(
  container: HTMLDivElement
) {
  if (isVertical) {
    container.setAttribute("aria-orientation", "vertical");
    const handler = container.querySelector(
      "#elevationProfileResizeHandler"
    ) as HTMLDivElement | null;
    const handlerContainer = container.querySelector(
      "#elevationProfileResizeContainer"
    ) as HTMLDivElement | null;

    handlerContainer!.classList.add("h-2", "left-0");
    handlerContainer!.classList.remove("w-3", "bottom-0");
    handler!.classList.remove("h-30", "w-0.5", "-mr-0.5");
    handler!.classList.add("h-0.5", "w-40", "-mb-0.5");
  } else {
    container.setAttribute("aria-orientation", "horizontal");
    const handler = container.querySelector(
      "#elevationProfileResizeHandler"
    ) as HTMLDivElement | null;
    const handlerContainer = container.querySelector(
      "#elevationProfileResizeContainer"
    ) as HTMLDivElement | null;

    handlerContainer!.classList.remove("h-2", "left-0");
    handlerContainer!.classList.add("w-3", "bottom-0");
    handler!.classList.remove("h-0.5", "w-40", "-mb-0.5");
    handler!.classList.add("h-30", "w-0.5", "-mr-0.5");
  }
}

export function toggleElevationProfileOrientation(
  elevationProfileContainer: HTMLDivElement
) {
  if (elevationProfileContainer) {
    isVertical = elevationProfileContainer.classList.toggle(
      "orientation-vertical"
    );
    elevationProfileContainer.classList.toggle("orientation-horizontal");
  }

  registerProfileResizeHandler(null, null);
  updateElevationProfileResizeHandlerStyles(elevationProfileContainer);

  return isVertical!;
}

export function getElevationProfileOrientation() {
  return isVertical === true ? "vertical" : "horizontal";
}

export function getElevationProfileVisibility() {
  return isVisible;
}

export function updateElevationProfileContainerStyles(
  elevationProfileContainer: HTMLDivElement,
  viewSize: number
) {
  const _isVertical = getElevationProfileOrientation() === "vertical";

  //   console.log("Orientation(Vertical):" + _isVertical);
  //   console.log("Visibility:" + isVisible);

  if (_isVertical) {
    elevationProfileContainer!.style.width = `100vw`;
    elevationProfileContainer!.style.height = `${viewSize}vh`;
    elevationProfileContainer!.style.transform = isVisible
      ? "translateY(0)"
      : `translateY(${viewSize}vh)`;
  } else {
    elevationProfileContainer!.style.height = `100vh`;
    elevationProfileContainer!.style.width = `${viewSize}vw`;
    elevationProfileContainer!.style.transform = isVisible
      ? "translateX(0)"
      : `translateX(-${viewSize}vw)`!;
  }
}

export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h === 0) {
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export function formatDistance(meters: number): string {
  if (meters < 0) meters = 0;

  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
}

import type { LatLngTuple } from "leaflet";
import L from "leaflet";


export function boundsToExtent(bounds: L.LatLngBounds) {
  const { lat: minLat, lng: minLng } = bounds.getSouthWest();
  const { lat: maxLat, lng: maxLng } = bounds.getNorthEast();

  return { minLat, minLng, maxLat, maxLng };
}


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

  const bounds = L.latLngBounds(
    [minLat, minLng], // south-west
    [maxLat, maxLng] // north-east
  );
  return bounds;
}

/**
 * Get center point [lat, lng] of a bbox (rect) given either coords array or bbox object.
 */
export function bboxCenterFromCoords(coords: LatLngTuple[]) {
  
  const bounds = bboxFromCoords(coords);
  const { minLat, minLng, maxLat, maxLng } = boundsToExtent(bounds)
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
      Math.sqrt(
        sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng
      ),
      Math.sqrt(
        1 -
          (sinDlat * sinDlat +
            Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng)
      )
    );
  return R * c;
}

/**
 * Max distance (meters) from bbox center to bbox corners (or optionally to all coords).
 * By default computes distance to the 4 bbox corners and returns the maximum.
 */
export function maxDistanceFromCenterToBbox(coords: LatLngTuple[]) {
  const bounds = bboxFromCoords(coords);
  const { minLat, minLng, maxLat, maxLng } = boundsToExtent(bounds)
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
  return { center: center, maxDistanceMeters: max };
}



/**
 * Convert longitude/latitude to tile x/y at a given zoom
 */
function lonLatToTile(
  lon: number,
  lat: number,
  zoom: number
): [number, number] {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return [x, y];
}

function latLngToTileXY(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const n = Math.pow(2, zoom);

  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    (1 -
      Math.log((1 + sinLat) / (1 - sinLat)) /
        (2 * Math.PI)) *
      n / 2
  );

  return { x, y };
}

export function getTilesInBounds(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number,
  zoom: number
) {
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
