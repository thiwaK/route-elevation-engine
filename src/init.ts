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
  boundsToExtent,
  downloadGeoJSON,
  getElevationProfileVisibility,
} from "./utilities";
import {
  addRoutes,
  clearTransitMarkers,
  getRoadSegement,
  resampleSegment,
} from "./TransitLayer";
import { fetchTiles, addContours } from "./Contourlayer";
import { Storage } from "./StorageAPI";
import {
  processPBF,
  xyArrayToGeojson,
  geojsonToXYArray,
  getEleveationAlongRoad,
} from "./GeoProcessor";
import { profile } from "./Profile";
import * as turf from "@turf/turf";
import type { LineString, MultiLineString } from "geojson";

export const storage = Storage();
export let map: L.Map;
let routeSegmentLayer: L.Polyline | null = null;
let storageListener: any;

// initialize elements
export const profileCanvas = document.getElementById(
  "chart"
) as HTMLCanvasElement | null;
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

  addRoutes(map);
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
  toggleElevationProfileVisibility(elevationProfileContainer!);

  if (getElevationProfileVisibility()) {
    const routeData = await getRoadSegement();
    if (routeData) {
      // console.log("distance:", formatDistance(routeData.distance));
      // console.log("duration:", formatTime(routeData.duration));
      // console.log("geometry:", routeData.geometry);

      const roadSegmentJson = xyArrayToGeojson(routeData.geometry);
      storage.saveSegment(roadSegmentJson);

      updateRouteSegment(routeSegmentLayer, routeData.distance);

      const bbox = bboxFromCoords(routeData.geometry);
      const { lat: minLat, lng: minLng } = bbox.getSouthWest();
      const { lat: maxLat, lng: maxLng } = bbox.getNorthEast();
      // if (routeSegmentLayer) {
      //   const boundsLayer = L.rectangle(bbox, {
      //     color: "#ff0000",
      //     weight: 2,
      //     fillColor: "#ff0000",
      //     fillOpacity: 0.5,
      //   });
      //   boundsLayer.addTo(map);
      // }

      const tiles = getTilesInBounds(minLat, minLng, maxLat, maxLng, 15);
      const fetchedTiles = await fetchTiles(tiles, {
        concurrency: 8,
        onProgress: (done, total) => {
          // console.log(`${done}/${total} tiles fetched`);
        },
      });
      // console.log(fetchedTiles);

      const contourJson = processPBF(fetchedTiles, "contour");
      storage.saveContours(contourJson);

      // L.geoJSON(contourJson, {}).addTo(map);
      // downloadGeoJSON(contourJson, "contour.json");
      // downloadGeoJSON(roadSegmentJson, "road.json");

      const elvAlongRoad = getEleveationAlongRoad(roadSegmentJson, contourJson);
      developProfile(elvAlongRoad, routeData.distance);
    }
  }
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


function addDistanceLabels(map: L.Map, polyline: L.Polyline) {
  const minLabels = 5;
  const maxLabels = 10;
  const unit = 'meters';
  const labelClass = 'distance-label';

  // ensure label group exists on polyline
  if (polyline._distanceLabelGroup) polyline._distanceLabelGroup.clearLayers();
  else polyline._distanceLabelGroup = L.layerGroup().addTo(map);

  // build turf line
  const coords = polyline.getLatLngs().map((ll: { lng: number; lat: number; }) => [ll.lng, ll.lat]);
  const line = turf.lineString(coords);
  const lengthMeters = turf.length(line, { units: 'meters' });

  // heuristic spacing by zoom
  const zoom = map.getZoom();
  const baseSpacing = 200; // meters at zoom ~13
  const spacing = baseSpacing / Math.pow(2, zoom - (13));

  // compute count and clamp
  let count = Math.round(lengthMeters / spacing);
  count = Math.max(minLabels, Math.min(maxLabels, count));

  // if very short, reduce count
  if (lengthMeters < count) count = Math.max(1, Math.floor(lengthMeters));

  const step = lengthMeters / (count + 1); // avoid endpoints

  function pointAtMeters(m: number) {
    return turf.along(line, m / 1000, { units: 'kilometers' }).geometry.coordinates; // [lng,lat]
  }

  for (let i = 1; i <= count; i++) {
    const d = i * step;
    const [lng, lat] = pointAtMeters(d);
    const aheadMeters = Math.min(d + 1, lengthMeters);
    const [lng2, lat2] = pointAtMeters(aheadMeters);
    const angle = (Math.atan2(lat2 - lat, lng2 - lng) * 180) / Math.PI;

    // round to whole numbers (optional rounding to nearest 5: Math.round(val/5)*5)
    const display = `${Math.round(d)} m`;

    const icon = L.divIcon({
      className: labelClass,
      html: `<div style="transform:rotate(${angle}deg);white-space:nowrap;">${display}</div>`
    });

    L.marker([lat, lng], { icon, interactive: false }).addTo(polyline._distanceLabelGroup);
  }
}

function updateRouteSegment(
  polylineRefObj: L.Polyline | null,
  distanceMeters: any
) {
  if (polylineRefObj) {
    // remove existing polyline and its labels
    if (polylineRefObj._distanceLabelGroup)
      polylineRefObj._distanceLabelGroup.remove();
    polylineRefObj.remove();
    polylineRefObj = null;
  }

  const roadSegmentXYArray = geojsonToXYArray(storage.roadSegment!);
  polylineRefObj = L.polyline(roadSegmentXYArray, {
    color: "#0074D9",
    weight: 4,
    opacity: 0.9,
  }).addTo(map);

  // add labels now and on zoom changes
  addDistanceLabels(map, polylineRefObj, {
    minLabels: 5,
    maxLabels: 10,
    unit: "meters",
  });

  // throttle re-labeling on zoomend
  if (!map._distanceLabelZoomHandlerAdded) {
    map.on("zoomend", () => {
      if (polylineRefObj)
        addDistanceLabels(map, polylineRefObj, {
          minLabels: 5,
          maxLabels: 10,
          unit: "meters",
        });
    });
    map._distanceLabelZoomHandlerAdded = true;
  }
}

async function onStorageChange() {}

async function developProfile(dataPoints: any[], distance: any) {
  let elvArray: Array<number> = [];

  dataPoints.forEach((element) => {
    elvArray.push(element.contourVal.ele);
  });

  profile(profileCanvas!, elvArray);
}

// ========================
initMap();
initProfileView();
initListeners();
