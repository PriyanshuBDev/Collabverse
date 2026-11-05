import { useEffect, useRef } from "react";

export default function useOverlayThumb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    let raf = 0;
    let hideTimer: NodeJS.Timeout;

    const update = () => {
      if (!el || !thumb) return;

      const scrollH = el.scrollHeight;
      const clientH = el.clientHeight;

      const ratio = clientH / scrollH;

      // thumb height
      const height = Math.max(20, ratio * clientH);
      thumb.style.height = `${height}px`;

      // thumb position
      const maxTop = clientH - height;
      const scrollRatio = el.scrollTop / (scrollH - clientH || 1);
      thumb.style.top = `${scrollRatio * maxTop}px`;
    };

    const onScroll = () => {
      thumb.classList.add("visible");

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => thumb.classList.remove("visible"), 700);
    };

    update();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
    };
  }, []);

  return { containerRef, thumbRef };
}
