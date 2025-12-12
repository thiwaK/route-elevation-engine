import { useRouteStore } from "@/lib/stores/routeStore";
import { TbDeselect } from "react-icons/tb";



export default function ClearButton() {
  const clearStore = useRouteStore((s) => s.clear);
  return (
    <button
      onClick={clearStore}
      className={`fixed bottom-10 right-4 p-3 rounded-full shadow-lg bg-blend-color bg-amber-800 transition z-50 ring-2 ring-amber-400`}
    >
      <span className="material-symbols-outlined"><TbDeselect className="w-5 h-5"/></span>
    </button>
  );
}
