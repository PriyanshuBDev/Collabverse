import React from "react";

export default function MainBtn({
  children,
  onClick,
  addOns,
  round,
  text,
  disable,
}: {
  children: React.ReactNode;
  onClick: () => void;
  addOns?: string;
  round?: string;
  text?: string;
  disable?: boolean;
}) {
  return (
    <button
      disabled={disable}
      onClick={() => {
        onClick();
      }}
      type="button"
      className={`disabled:cursor-not-allowed cursor-pointer text-gray-400 dark:text-white h-fit text-nowrap bg-gradient-to-r from-emerald-500 to-emerald-700 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-emerald-300 dark:focus:ring-emerald-800 font-medium ${round ?? "rounded-lg"} ${text ?? "text-sm md:text-base"} text-center ${addOns}`}
    >
      {children}
    </button>
  );
}
