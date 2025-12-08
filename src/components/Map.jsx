"use client";

import { useEffect } from "react";
import L from "leaflet";

export default function Map() {
  useEffect(() => {
    const map = L.map("map").setView([7.9, 83.5], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" className="w-full h-full" />;
}
