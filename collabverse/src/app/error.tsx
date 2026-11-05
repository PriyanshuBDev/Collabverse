"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen p-4 text-center bg-gray-50 dark:bg-blk3">
      <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  );
}
