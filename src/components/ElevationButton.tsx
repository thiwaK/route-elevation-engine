import { PiMountainsFill } from "react-icons/pi";
import { useRouteStore } from "@/lib/stores/routeStore";
import { useEffect, useCallback, useState } from "react";
import { roadSegment } from "@/lib/roadSegment";
import { formatTime, formatDistance } from "@/lib/utils/formatters";
import { ContourLayer } from "./map/Contourlayer";

interface ElevationButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function ElevationButton({
  onClick,
  active,
}: ElevationButtonProps) {
  const setSegment = useRouteStore((s) => s.setSegment);
  const segment = useRouteStore((s) => s.segment);
  const points = useRouteStore((s) => s.points);
  const [showContours, setShowContours] = useState(false);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) throw new Error("MAPBOX_TOKEN is required");

  const updateSegment = useCallback(async () => {
    if (points.length < 2) {
      setSegment(null);
      return;
    }
    const seg = await roadSegment(points, accessToken);
    if (seg) {
      // console.log("geometry:", seg.geometry);
      console.log("distance:", formatDistance(seg.distance));
      console.log("duration:", formatTime(seg.duration));
      setSegment(seg.geometry);
    }
  }, [points, setSegment, accessToken]);

  
  const handleClick = async () => {
    onClick();
    await updateSegment();
    setShowContours((s) => !s); // or set to true to trigger rendering/update
  };

  return (
    <button
      title="Show elevation profile"
      aria-label="Show elevation profile"
      onClick={handleClick}
      className={`fixed bottom-25 right-4 
        p-3 rounded-full shadow-md bg-sky-800 
        transition-all transform z-50 
        hover:scale-105 hover:bg-sky-900 hover:shadow-sky-950 hover:shadow-lg`}
    >
      <span className="material-symbols-outlined">
        <PiMountainsFill className="w-5 h-5" />
      </span>

      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap rounded bg-gray-900 text-white text-xs px-2 py-1 shadow-lg">
        Show elevation profile
      </span>
    </button>
  );
}
