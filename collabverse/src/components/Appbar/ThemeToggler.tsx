"use client";

import useMounted from "@/lib/hooks/useMounted";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";
import { useTheme } from "next-themes";

export default function ThemeToggler() {
  // const { toggleTheme, isTogglingTheme } = useUserAppbar();
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;
  const handleThemeChange = async () => {
    // if (isTogglingTheme) return;
    const theme = isDark ? "light" : "dark";
    setTheme(theme);
    // toggleTheme({ theme: theme === "dark" ? "Dark" : "Light" });
  };
  const isDark = resolvedTheme === "dark";
  return (
    <label className="themeToggle st-sunMoonThemeToggleBtn w-6 h-6 ">
      <input
        type="checkbox"
        id="themeToggle"
        checked={isDark}
        className="themeToggleInput"
        onChange={handleThemeChange}
      />
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="currentColor"
        stroke="none"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="20" height="20" fill="white"></rect>
          <circle cx="11" cy="3" r="8" fill="black"></circle>
        </mask>
        <circle
          className="sunMoon"
          cx="10"
          cy="10"
          r="8"
          mask="url(#moon-mask)"
        ></circle>
        <g>
          <circle className="sunRay sunRay1" cx="18" cy="10" r="1.5"></circle>
          <circle
            className="sunRay sunRay2"
            cx="14"
            cy="16.928"
            r="1.5"
          ></circle>
          <circle
            className="sunRay sunRay3"
            cx="6"
            cy="16.928"
            r="1.5"
          ></circle>
          <circle className="sunRay sunRay4" cx="2" cy="10" r="1.5"></circle>
          <circle
            className="sunRay sunRay5"
            cx="6"
            cy="3.1718"
            r="1.5"
          ></circle>
          <circle
            className="sunRay sunRay6"
            cx="14"
            cy="3.1718"
            r="1.5"
          ></circle>
        </g>
      </svg>
    </label>
  );
}
