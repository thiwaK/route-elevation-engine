"use client";

import { useState } from "react";
import ElevationButton from "./ElevationButton";
import ElevationContainer from "./ElevationContainer";

export default function ElevationTool() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <ElevationButton onClick={() => setOpen(v => !v)} active={open} />
      {open && <ElevationContainer />}
    </>
  );
}
