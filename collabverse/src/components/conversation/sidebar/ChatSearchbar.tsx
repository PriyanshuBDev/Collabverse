"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ChatSearchbar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <form className=" flex w-full max-w-60">
      <label className="mb-2 text-xs font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative flex w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-3 h-3 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill={`${resolvedTheme === "dark" ? "currentColor" : "none"}`}
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full px-3  py-1.5 ps-8 text-sm text-gray-900 border border-gray-300 rounded-full bg-gray-100 focus:outline-none dark:text-gray-200 dark:bg-blk3 dark:border-gray-600 "
          placeholder="Search users..."
          required
        />
      </div>
    </form>
  );
}
