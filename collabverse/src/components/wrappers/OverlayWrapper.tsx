import { ReactNode, RefObject } from "react";

export default function OverlayWrapper({
  active,
  children,
  addOns,
  ref,
}: {
  active: boolean;
  children: ReactNode;
  addOns?: string;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
        active ? "visible" : "invisible pointer-events-none"
      }`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <div
        ref={ref}
        className={`transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1001 p-5 ${addOns} ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
