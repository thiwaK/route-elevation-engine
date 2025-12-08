interface ElevationButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function ElevationButton({ onClick, active }: ElevationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg bg-white transition z-50 ${
        active ? "ring-2 ring-green-600" : ""
      }`}
    >
      <span className="material-symbols-outlined">elevation</span>
    </button>
  );
}
