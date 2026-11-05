import { useEffect, useState } from "react";

export function useSkeletonCount(
  initialCount: number,
  small: number,
  medium: number,
  large: number,
  extrLarge?: number,
) {
  const [count, setCount] = useState(initialCount); // default (SSR-safe)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;

      if (width >= 1536) setCount(extrLarge ?? large);
      else if (width >= 1280) setCount(large);
      else if (width >= 768) setCount(medium);
      else setCount(small);
    };

    update(); // run on mount
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [initialCount, small, medium, large, extrLarge]);

  return count;
}
