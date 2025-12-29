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
} from "./utilities";

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
export let map!: L.Map;
if (mapElement) {
  map = L.map(mapElement, { center: [51.505, -0.09], zoom: 13 });
  if (!map) {
    throw new Error("Map initialization failed");
  }
}
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// initialize profile view
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

// initialize listeners
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

// event functions
export function onElevationButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  onElevationProfileCloseButtonClick(ev);
}

export function onElevationProfileOrientationButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  toggleElevationProfileOrientation(elevationProfileContainer!);
  updateElevationProfileContainerStyles(
    elevationProfileContainer!,
    profileViewInitialSize
  );
  updateElevationProfileOrientationIcon(btnProfileViewOrientation!);
}

export function onElevationProfileCloseButtonClick(ev: MouseEvent) {
  ev.preventDefault();
  toggleElevationProfileVisibility(elevationProfileContainer!);
  updateElevationProfileContainerStyles(
    elevationProfileContainer!,
    profileViewInitialSize
  );
}
