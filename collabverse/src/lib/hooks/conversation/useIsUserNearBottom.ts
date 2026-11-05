import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

export function useIsUserNearBottom(
  chatContainerRef: RefObject<HTMLDivElement | null>,
  isUserNearBottomRef: RefObject<boolean>,
  setShowScrollButton: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    const c = chatContainerRef.current;
    if (!c) return;
    const onScroll = () => {
      const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 10;
      isUserNearBottomRef.current = nearBottom;
      setShowScrollButton(!nearBottom);
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => c.removeEventListener("scroll", onScroll);
  }, [setShowScrollButton, chatContainerRef, isUserNearBottomRef]);
}
