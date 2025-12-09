"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";
import { useEffect } from "react";
import { fixLeafletIcon } from "@/lib/leafletIconFix";
import { TransitLayer } from "@/components/map/TransitLayer";



export default function Map() {
  useEffect(() => {
    fixLeafletIcon();
  }, []);
  

    return (
      <div className="w-full z-0" style={{ height: "100vh" }}>
        <MapContainer
          center={[7.9, 81.0]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <TransitLayer />
          
        </MapContainer>
      </div>
    );
}
