import { PiMountainsFill } from "react-icons/pi";

interface ElevationButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function ElevationButton({ onClick, active }: ElevationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-10 right-4 p-3 rounded-full shadow-lg bg-blend-color bg-amber-800 transition z-50 ${
        active ? "ring-2 ring-amber-400" : ""
      }`}
    >
      <span className="material-symbols-outlined"><PiMountainsFill className="w-5 h-5"/></span>
    </button>
  );
}
