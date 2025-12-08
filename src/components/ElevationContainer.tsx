"use client";

import { useEffect, useRef, useState } from "react";
import {
  BiSolidDockLeft,
  BiSolidDockRight,
  BiSolidDockTop,
  BiSolidDockBottom,
} from "react-icons/bi";
import { RiCloseCircleFill } from "react-icons/ri";


interface ElevationContainerProps {
  initialOrientation?: "vertical" | "horizontal";
  initialPercent?: number; // 0-100
  active?: boolean; // new
  onClose?: () => void;
}



export default function ElevationContainer({
  initialOrientation = "vertical",
  initialPercent = 40,
  active = false,
  onClose
}: ElevationContainerProps) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    initialOrientation
  );
  const [percent, setPercent] = useState<number>(initialPercent);
  const dragging = useRef(false);

  const resizeOffsetPercentage = 10; // min/max clamp
  
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;

      if (orientation === "vertical") {
        // For vertical, anchored to bottom
        const newPercent = Math.max(
          resizeOffsetPercentage,
          Math.min(
            100 - resizeOffsetPercentage,
            ((window.innerHeight - e.clientY) / window.innerHeight) * 100
          )
        );
        setPercent(newPercent);
      } else {
        // For horizontal, anchored to left
        const newPercent = Math.max(
          resizeOffsetPercentage,
          Math.min(
            100 - resizeOffsetPercentage,
            (e.clientX / window.innerWidth) * 100
          )
        );
        setPercent(newPercent);
      }
    }

    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [orientation]);

  function startDrag(e: React.MouseEvent) {
    dragging.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      orientation === "vertical" ? "row-resize" : "col-resize";
    e.preventDefault();
  }

  function toggleOrientation() {
    setOrientation((o) => (o === "vertical" ? "horizontal" : "vertical"));
  }

  function resetSize() {
    setPercent(initialPercent);
  }

  // const style: React.CSSProperties =
  //   orientation === "vertical"
  //     ? { position: "fixed", left: 0, right: 0, bottom: 0, height: `${percent}vh`, zIndex: 30 }
  //     : { position: "fixed", top: 0, bottom: 0, left: 0, width: `${percent}vw`, zIndex: 30 };

  const style: React.CSSProperties =
    orientation === "vertical"
      ? {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${percent}vh`,
          transform: active ? "translateY(0)" : `translateY(${percent}vh)`,
          transition: "transform 0.3s ease",
          zIndex: 30,
        }
      : {
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${percent}vw`,
          transform: active ? "translateX(0)" : `translateX(-${percent}vw)`,
          transition: "transform 0.3s ease",
          zIndex: 30,
        };

  return (
    <div
      style={style}
      className="bg-red-700 shadow-lg p-4 overflow-hidden transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-white">Elevation Profile</div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOrientation}
            className="px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 flex items-center justify-center"
            title="Toggle orientation"
          >
            {orientation === "vertical" ? (
              <BiSolidDockLeft className="w-5 h-5" />
            ) : (
              <BiSolidDockBottom className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20"
            title="Close"
          >
            <RiCloseCircleFill className="w-5 h-5" />
          </button>
        </div>
      </div>

      <canvas
        id="chart"
        className="w-full h-36 bg-white/5 rounded mb-2"
      ></canvas>

      <div className="flex justify-between text-sm text-white/90 mt-2">
        <span id="min-elevation">Min:</span>
        <span id="max-elevation">Max:</span>
      </div>

      {/* Resize handle */}
      {orientation === "vertical" ? (
        <div
          onMouseDown={startDrag}
          role="separator"
          aria-orientation="horizontal"
          className="absolute left-0 right-0 top-0 h-3 flex items-center justify-center"
          style={{ cursor: "row-resize", zIndex: 40 }}
          title="Drag to resize"
        >
          <div className="h-0.5 w-40 bg-accent-content flex items-center justify-center -mb-0.5 rounded transition-all"></div>
        </div>
      ) : (
        <div
          onMouseDown={startDrag}
          role="separator"
          aria-orientation="vertical"
          className="absolute top-0 bottom-0 right-0 w-3 flex items-center justify-center"
          style={{ cursor: "col-resize", zIndex: 40 }}
          title="Drag to resize"
        >
          <div className="h-30 w-0.5 bg-accent-content flex items-center justify-center -mr-0.5 rounded transition-all"></div>
        </div>
      )}
    </div>
  );
}
