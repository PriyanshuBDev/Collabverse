import { ReactNode, useRef, useEffect } from "react";

export default function ScrollableOverlayWrapper({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // optional: prevent background scroll when active
  useEffect(() => {
    if (active) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [active]);

  return (
    <div
      className={`fixed inset-0 bg-black/30 flex items-center justify-center z-110 overflow-y-auto lg:overflow-y-hidden ${
        active ? "visible" : "invisible pointer-events-none"
      }`}
    >
      <div
        ref={ref}
        className={`transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1 p-5 max-h-[90vh] overflow-y-auto lg:overflow-y-hidden ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
