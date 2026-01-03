"use client";

import { useState } from "react";
import ElevationButton from "./ElevationButton";
import ClearButton from "./ClearButton";
import ElevationContainer from "./ElevationContainer";
import { formatTime, formatDistance } from "@/lib/utils/formatters";
import { Storage } from "@/lib/stores/storeApi";

export default function ElevationTool() {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((v) => !v);
  const { points, segment } = Storage();

  return (
    <>
      {points.length > 0 && <ClearButton />}
      {points.length > 1 && (
        <ElevationButton onClick={toggleOpen} />
      )}
      <ElevationContainer active={open} onClose={toggleOpen} />
    </>
  );
}
