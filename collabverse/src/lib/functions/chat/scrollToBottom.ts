import { RefObject } from "react";

export function scrollToBottomFunction({
  chatContainerRef,
  isAutoScrollingRef,
  smooth = true,
}: {
  chatContainerRef: RefObject<HTMLDivElement | null>;
  isAutoScrollingRef: RefObject<boolean>;
  smooth?: boolean;
}) {
  const c = chatContainerRef.current;
  if (!c) return;
  isAutoScrollingRef.current = true;
  c.scrollTo({ top: c.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  // give the browser time to complete.
  window.setTimeout(() => {
    isAutoScrollingRef.current = false;
  }, 300);
}
