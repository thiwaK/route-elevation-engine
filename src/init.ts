import L from "leaflet";
import {
  profileViewInitialOrientation,
  profileViewInitialSize,
  registerOnClickListener,
  registerProfileResizeHandler,
  toggleElevationProfileVisibility,
  toggleElevationProfileOrientation,
  updateElevationProfileResizeHandlerStyles,
  updateElevationProfileContainerStyles,
  updateElevationProfileOrientationIcon,
  formatDistance,
  formatTime,
  bboxFromCoords,
  bboxCenterFromCoords,
  maxDistanceFromCenterToBbox,
  getTilesInBounds,
  boundsToExtent
} from "./utilities";
import {
  addRoutes,
  clearTransitMarkers,
  getRoadSegement,
  resampleSegment,
} from "./TransitLayer";
import { getContours, addContours } from "./Contourlayer";
import { Storage } from "./StorageAPI";

export const storage = Storage();
export let map: L.Map;
let transitLayer: any;
let storageListener: any;
let routeSegmentLayer: L.Polyline | null = null;

// initialize elements
export const mapElement = document.getElementById(
  "map"
) as HTMLDivElement | null;
export const mapContainer = document.getElementById(
  "mapContainer"
) as HTMLDivElement | null;
export const elevationProfileContainer = document.getElementById(
  "elevationProfileContainer"
) as HTMLDivElement | null;
export const btnProfileViewOrientation = document.getElementById(
  "btnProfileViewOrientation"
) as HTMLButtonElement | null;
export const btnProfileViewClose = document.getElementById(
  "btnProfileViewClose"
) as HTMLButtonElement | null;
export const btnClear = document.getElementById(
  "btnClear"
) as HTMLButtonElement | null;
export const btnElevation = document.getElementById(
  "btnElevation"
) as HTMLButtonElement | null;
export const elevationProfileResizeHandler = document.getElementById(
  "elevationProfileResizeHandler"
) as HTMLDivElement | null;
export const elevationProfileResizeContainer = document.getElementById(
  "elevationProfileResizeContainer"
) as HTMLDivElement | null;

// initialize map
function initMap() {
  if (mapElement) {
    map = L.map(mapElement, { center: [51.505, -0.09], zoom: 15 });
    if (!map) {
      throw new Error("Map initialization failed");
    }
  }
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors, &copy; MapBox",
  }).addTo(map);
  transitLayer = addRoutes(map);
}

// initialize profile view
function initProfileView() {
  elevationProfileContainer?.classList.add(
    `orientation-${profileViewInitialOrientation}`
  );
  updateElevationProfileContainerStyles(
    elevationProfileContainer!,
    profileViewInitialSize
  );
  updateElevationProfileResizeHandlerStyles(elevationProfileContainer!);
  setTimeout(function () {
    elevationProfileContainer?.classList.remove("hidden");
  }, 500);
}

// initialize listeners
function initListeners() {
  registerOnClickListener(
    btnProfileViewOrientation,
    onElevationProfileOrientationButtonClick
  );
  registerOnClickListener(
    btnProfileViewClose,
    onElevationProfileCloseButtonClick
  );
  registerOnClickListener(btnElevation, onElevationButtonClick);
  registerProfileResizeHandler(
    elevationProfileResizeHandler!,
    elevationProfileContainer!
  );
  registerOnClickListener(btnClear, onClearSelections);

  storageListener = storage.listener((state) => {
    // console.log("Storage changed:", state.points);
    onStorageChange();
  });
}

async function onElevationButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  const routeData = await getRoadSegement();
  if (routeData) {
    // console.log("geometry:", seg.geometry);
    console.log("distance:", formatDistance(routeData.distance));
    console.log("duration:", formatTime(routeData.duration));
    storage.setSegment(routeData.geometry);
  }
  toggleElevationProfileVisibility(elevationProfileContainer!);
}

function onElevationProfileOrientationButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  toggleElevationProfileOrientation(elevationProfileContainer!);
  updateElevationProfileContainerStyles(
    elevationProfileContainer!,
    profileViewInitialSize
  );
  updateElevationProfileOrientationIcon(btnProfileViewOrientation!);
}

function onElevationProfileCloseButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  toggleElevationProfileVisibility(elevationProfileContainer!);
  updateElevationProfileContainerStyles(
    elevationProfileContainer!,
    profileViewInitialSize
  );
}

function onClearSelections() {
  clearTransitMarkers();
  storage.clear();
  if (routeSegmentLayer) {
    routeSegmentLayer.remove();
    routeSegmentLayer = null;
  }
}

function updateRouteSegment() {
  if (routeSegmentLayer) {
    routeSegmentLayer.remove();
    routeSegmentLayer = null;
  }

  routeSegmentLayer = L.polyline(storage.segment!, {
    color: "#0074D9",
    weight: 4,
    opacity: 0.9,
  }).addTo(map);
}

function onStorageChange() {
  if (storage.segment) {
    updateRouteSegment();
    if (routeSegmentLayer) {
      const bbox = bboxFromCoords(storage.segment);
      // const resampledRouteSegment = resampleSegment(routeSegmentLayer!, 10);
      // const routeSegmentCenter = bboxCenterFromCoords(storage.segment);
      // const {
      //   center: routeSegmentCenter,
      //   maxDistanceMeters: routeSegmentRadious,
      // } = maxDistanceFromCenterToBbox(storage.segment);

      // getContours(routeSegmentCenter, routeSegmentRadious, ["contour"]);

      const boundsLayer = L.rectangle(bbox, {
        color: "#ff0000", // outline color
        weight: 2, // outline width
        fillColor: "#ff0000", // fill color
        fillOpacity: 0.5, // THIS is what you want
      });
      boundsLayer.addTo(map);

      const { lat: minLat, lng: minLng } = bbox.getSouthWest();
      const { lat: maxLat, lng: maxLng } = bbox.getNorthEast();
      const tiles = getTilesInBounds(
        minLat,
        minLng,
        maxLat,
        maxLng,
        15
      );
      console.log(tiles)
      addContours(map, bbox);
    }
  }
}

// ========================
initMap();
initProfileView();
initListeners();
