import { useEffect } from "react";

export function useClickOutSide(
  refs:
    | React.RefObject<HTMLElement | null>
    | React.RefObject<HTMLElement | null>[],
  callback: () => void
) {
  useEffect(() => {
    const refArray = Array.isArray(refs) ? refs : [refs];
    const handler = (e: MouseEvent | TouchEvent) => {
      const clickedInside = refArray.some((ref) => {
        return ref.current && ref.current.contains(e.target as Node);
      });

      if (!clickedInside) callback();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [refs, callback]);
}
