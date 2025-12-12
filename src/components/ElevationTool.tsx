"use client";

import { useState } from "react";
import ElevationButton from "./ElevationButton";
import ClearButton from "./ClearButton";
import ElevationContainer from "./ElevationContainer";
import { useRouteStore } from "@/lib/stores/routeStore";
import { formatTime, formatDistance } from "@/lib/utils/formatters";

export default function ElevationTool() {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((v) => !v);
  const { points, segment } = useRouteStore();

  return (
    <>
      {points.length > 0 && <ClearButton />}
      {points.length > 1 && (
        <ElevationButton onClick={toggleOpen} active={open} />
      )}
      <ElevationContainer active={open} onClose={toggleOpen} />
    </>
  );
}
