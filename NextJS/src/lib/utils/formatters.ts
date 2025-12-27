export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h === 0) {
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export function formatDistance(meters: number): string {
  if (meters < 0) meters = 0;

  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
}
