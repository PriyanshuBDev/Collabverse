import { Dispatch, SetStateAction, useEffect } from "react";

export function useWidthResize(setWidth: Dispatch<SetStateAction<number>>) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [setWidth]);
}
