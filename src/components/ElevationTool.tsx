"use client";

import { useState } from "react";
import ElevationButton from "./ElevationButton";
import ElevationContainer from "./ElevationContainer";

export default function ElevationTool() {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((v) => !v);

  return (
    <>
      <ElevationButton onClick={toggleOpen} active={open} />
      <ElevationContainer active={open} onClose={toggleOpen} />
    </>
  );
}
