import "leaflet/dist/leaflet.css";
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
  getElevationProfileVisibility,
  sortPaired,
} from "./utilities";
import {
  addRoutes,
  clearTransitMarkers,
  getRoadSegement,
} from "./TransitLayer";
import { fetchTiles as fetchTilesContour } from "./Contourlayer";
import { Storage } from "./StorageAPI";
import {
  processPBF,
  geojsonToXYArray,
  getElevationAlongRoad,
  contoursToLines,
  distanceBetweenPoints,
  getTilesInBounds,
} from "./GeoProcessor";
import { profile } from "./Profile";
import { point } from "@turf/turf";

export const storage = Storage();
export let map: L.Map;
let mapLayers:any[] = []
let storageListener: any;

// initialize elements
const profileCanvas = document.getElementById(
  "chart"
) as HTMLCanvasElement | null;
const mapElement = document.getElementById(
  "map"
) as HTMLDivElement | null;
const mapContainer = document.getElementById(
  "mapContainer"
) as HTMLDivElement | null;
const elevationProfileContainer = document.getElementById(
  "elevationProfileContainer"
) as HTMLDivElement | null;
const btnProfileViewOrientation = document.getElementById(
  "btnProfileViewOrientation"
) as HTMLButtonElement | null;
const btnProfileViewClose = document.getElementById(
  "btnProfileViewClose"
) as HTMLButtonElement | null;
const btnClear = document.getElementById(
  "btnClear"
) as HTMLButtonElement | null;
const btnElevation = document.getElementById(
  "btnElevation"
) as HTMLButtonElement | null;
const elevationProfileResizeHandler = document.getElementById(
  "elevationProfileResizeHandler"
) as HTMLDivElement | null;
const elevationProfileResizeContainer = document.getElementById(
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
  if (!getElevationProfileVisibility())
    toggleElevationProfileVisibility(elevationProfileContainer!);

  const routeData = await getRoadSegement();
  console.log("routeData:", routeData);

  if (routeData) {
    const routeSegmentJson = routeData.geojson;
    const boundingBox = routeData.boundingBox;

    storage.saveSegment(routeSegmentJson);
    updateRouteSegment();

    // if (boundingBox) {
    //   const boundsLayer = L.rectangle(boundingBox, {
    //     color: "#ff0000",
    //     weight: 2,
    //     fillColor: "#ff0000",
    //     fillOpacity: 0.5,
    //   });
    //   boundsLayer.addTo(map);
    // }

    const tiles = getTilesInBounds(boundingBox, 15);
    const fetchedTiles = await fetchTilesContour(tiles, {
      concurrency: 8,
      onProgress: (done, total) => {
        // console.log(`${done}/${total} tiles fetched`);
      },
    });
    // console.log(fetchedTiles);

    const contourJson = processPBF(fetchedTiles, "contour");
    storage.saveContours(contourJson);

    const contourLines = contoursToLines(contourJson);
    console.log("contourLines", contourLines);
    // if (contourLines) {
    //   const boundsLayer = L.geoJSON(contourLines.features);
    //   boundsLayer.addTo(map);
    // }

    // L.geoJSON(contourJson, {}).addTo(map);
    // downloadGeoJSON(contourJson, "contour.json");
    // downloadGeoJSON(roadSegmentJson, "road.json");

    const elvAlongRoad = getElevationAlongRoad(routeSegmentJson, contourLines);
    console.log("elvAlongRoad", elvAlongRoad);
    developProfile(elvAlongRoad, routeData.distance);
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
  for (let i = 0; i < mapLayers.length; i++) {
    mapLayers[i].remove()
  }
  mapLayers = []
}

function updateRouteSegment() {

  for (let i = 0; i < mapLayers.length; i++) {
    mapLayers[i].remove()
  }

  mapLayers = []

  const roadSegmentXYArray = geojsonToXYArray(storage.roadSegment!)
  const routeSegmentLayer = L.polyline(roadSegmentXYArray, {
    color: "#0074D9",
    weight: 4,
    opacity: 0.9,
  }).addTo(map);
  mapLayers.push(routeSegmentLayer)
}

async function onStorageChange() {}

async function developProfile(dataPoints: any[], distanceM: number) {
  let elvArray: Array<number> = [];
  let lblArray: Array<number> = [];
  let firstCoord: number[] | null = null;
  
  for (let i = 0; i < dataPoints.length; i++) {
    const element = dataPoints[i];

    if (element.point.features.length > 0) {
      const coord: number[] = element.point.features[0].geometry.coordinates;
      const ele: number = element.contour.properties.ele;
      if (!firstCoord) firstCoord = coord;

      const distance = distanceBetweenPoints(firstCoord, coord);

      lblArray.push(distance);
      elvArray.push(ele);
      const po = point(coord, { ele: ele });
      const poLayer = L.geoJSON(po, {
        pointToLayer: (feature, latlng) => {
          const value = feature.properties?.ele ?? "";
          const html = `<div class="ele-marker">${value}</div>`;
          const icon = L.divIcon({
            className: "ele-div-icon",
            html,
            iconSize: [40, 24],
            iconAnchor: [20, 12],
          });
          return L.marker(latlng, { icon });
        },
      }).addTo(map);
      mapLayers.push(poLayer)
    }
  }

  const { a: lbl, b: ele } = sortPaired(lblArray, elvArray);

  profile(profileCanvas!, ele.slice(1), lbl.slice(1));
}

// ========================
initMap();
initProfileView();
initListeners();

