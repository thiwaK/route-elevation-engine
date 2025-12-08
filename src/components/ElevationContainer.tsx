"use client";

interface ElevationContainerProps {}

export default function ElevationContainer({}: ElevationContainerProps) {
  return (
    <div className="fixed bottom-20 top-20 right-4 bg-red-700 shadow-lg p-4 rounded w-72 z-30">
      <div className="ml-2 font-semibold">Elevation Profile</div>

      <canvas id="chart" className="hidden"></canvas>

      <div className="flex justify-between text-sm mt-2">
        <span id="min-elevation">Min:</span>
        <span id="max-elevation">Max:</span>
      </div>
    </div>
  );
}
