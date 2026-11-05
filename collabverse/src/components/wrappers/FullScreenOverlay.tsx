"use client";
import { ReactNode, useEffect } from "react";

export default function FullScreenOverlay({
  active,
  children,
  addOns,
}: {
  active: boolean;
  children: ReactNode;
  addOns?: string;
}) {
  useEffect(() => {
    if (!active) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [active]);
  return (
    <div
      className={`fixed inset-0 transition-all duration-300 overflow-hidden
  bg-black/30
  backdrop-blur-xl
  border border-white/10
  rounded-3xl
  shadow-2xl
 z-1001 p-5  ${addOns} ${
   active ? "opacity-100 scale-100 " : "opacity-0 scale-50 pointer-events-none"
 }`}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
