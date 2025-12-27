import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Patch Leaflet's default icon paths
export function fixLeafletIcon() {
  const DefaultIcon = L.Icon.Default.prototype;

  // DefaultIcon.options.iconUrl = markerIcon.src;
  // DefaultIcon.options.iconRetinaUrl = markerIcon2x.src;
  // DefaultIcon.options.shadowUrl = markerShadow.src;
}
