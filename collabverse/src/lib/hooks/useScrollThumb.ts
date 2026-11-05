import { useEffect, useRef, useState } from "react";

export default function useScrollThumb() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      setShow(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setShow(false);
      }, 800);
    };
    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  return { ref, show };
}
