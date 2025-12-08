"use client";
import dynamic from "next/dynamic";


export default function Page() {

  const Map = dynamic(() => import("@/components/Map"), { ssr: false });
  
  return (
    <main className="relative min-h-screen">
      <Map/>
    </main>
  );
}
