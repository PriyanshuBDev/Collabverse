import { ReactNode } from "react";

export default function Toolbar({
  children,
  top,
  addOns,
  text,
  padding,
}: {
  children: ReactNode;
  top: string;
  addOns?: string;
  text?: string;
  padding?: string;
}) {
  return (
    <div
      className={`${addOns} transition-all duration-600 cursor-pointer ${text ?? "text-xs"} absolute  left-1/2 -translate-x-1/2 w-fit ${padding ?? "px-2 py-1"} rounded-md group-hover:visible group-hover:opacity-90 invisible opacity-0 text-nowrap pointer-events-none bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-800 ${top}`}
    >
      {children}
    </div>
  );
}
