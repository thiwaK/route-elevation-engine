"use client";
import dynamic from "next/dynamic";
import ElevationContainer from "@/components/ElevationContainer";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

const ElevationTool = dynamic(
  () => import("@/components/ElevationTool"),
  { ssr: false }
);


export default function Page() {
  return (
    <div className="root">
      <main className="relative min-h-screen z-10">
        <Map />
      </main>

      <ElevationTool />
    </div>
  );
}
