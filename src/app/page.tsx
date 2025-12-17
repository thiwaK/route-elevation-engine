"use client";

import { TransitLayer } from "@/components/map/TransitLayer";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet.vectorgrid";
import { useEffect } from "react";
import { fixLeafletIcon } from "@/lib/leafletIconFix";
// const ElevationTool = dynamic(() => import("@/components/ElevationTool"), {
//   ssr: false,
// });

export default function Page() {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  return (
    <div className="root">
      <main className="relative min-h-screen z-10">
        <div className="w-full z-0" style={{ height: "100vh" }}>
          <MapContainer
            center={[7.9, 81.0]}
            zoom={10}
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
      </main>

      {/* <ElevationTool /> */}
    </div>
  );
}
