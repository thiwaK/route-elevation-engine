import { PiMountainsFill } from "react-icons/pi";
import { useRouteStore } from "@/lib/stores/routeStore";
import { useEffect, useCallback } from "react";
import { roadSegment } from "@/lib/roadSegment";
import { formatTime, formatDistance } from "@/lib/utils/formatters";

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

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) throw new Error("MAPBOX_TOKEN is required");

  const updateSegment = useCallback(async () => {
    if (points.length < 2) {
      setSegment(null);
      return;
    }
    const seg = await roadSegment(points, accessToken);
    if (seg) {
      console.log("distance:", formatDistance(seg.distance));
      console.log("duration:", formatTime(seg.duration));
      setSegment(seg.geometry);
    }
  }, [points, setSegment, accessToken]);

  const handleClick = async () => {
    onClick();
    await updateSegment();
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-10 right-4 p-3 rounded-full shadow-lg bg-blend-color bg-amber-800 transition z-50 ${
        active ? "ring-2 ring-amber-400" : ""
      }`}
    >
      <span className="material-symbols-outlined">
        <PiMountainsFill className="w-5 h-5" />
      </span>
    </button>
  );
}
