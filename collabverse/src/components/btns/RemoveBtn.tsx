"use client";
export default function RemoveBtn({
  onClick,
  addOns,
}: {
  onClick: () => void;
  addOns?: string;
}) {
  return (
    <button
      className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer text-white text-xs lg:text-sm font-semibold bg-red-400 ${addOns}`}
      onClick={() => onClick()}
    >
      Remove
    </button>
  );
}
