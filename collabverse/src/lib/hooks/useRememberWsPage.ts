"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function useRememberWsPage() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/app") && !pathname.includes("/projects")) {
      localStorage.setItem("last-workspace-path", pathname);
    }
  }, [pathname]);
}
