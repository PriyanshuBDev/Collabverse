"use client";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

export function SafeThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme && !["light", "dark", "system"].includes(theme)) {
        localStorage.removeItem("theme");
      }
    } catch {
      localStorage.removeItem("theme");
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
