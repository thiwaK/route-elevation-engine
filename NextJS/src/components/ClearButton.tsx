import { useRouteStore } from "@/lib/stores/routeStore";
import { TbDeselect } from "react-icons/tb";

export default function ClearButton() {
  const clearStore = useRouteStore((s) => s.clear);
  return (
    <button
      title="Clear selection"
      aria-label="Clear selection"
      onClick={clearStore}
      className={`fixed bottom-10 right-4 
        p-3 rounded-full shadow-md bg-sky-800 
        transition transform z-50 
         hover:scale-105 hover:bg-sky-900 hover:shadow-sky-950 hover:shadow-lg`}
    >
      <span className="material-symbols-outlined">
        <TbDeselect className="w-5 h-5" />
      </span>

      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap rounded bg-gray-900 text-white text-xs px-2 py-1 shadow-lg">
        Clear selection
      </span>
    </button>
  );
}
