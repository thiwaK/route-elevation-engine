"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { fixLeafletIcon } from "@/lib/leafletIconFix";

export default function Map() {
  useEffect(() => {
    fixLeafletIcon(); // Patch Leaflet icons once
  }, []);

  return (
    <div id="map" className="w-full z-0" style={{ height: "100vh" }}>
      <MapContainer
        center={[7.9, 81.0]}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </MapContainer>
    </div>
  );
}
