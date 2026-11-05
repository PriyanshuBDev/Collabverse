import { useRef, useState } from "react";
import { CircularProgress } from "../progress/CircularProgress";
import { downloadBatch } from "@/lib/functions/download/downloadBatch";
import axios from "axios";

export default function DownloadButton({
  urls,
  isUser,
}: {
  urls: string[];
  isUser: boolean;
}) {
  const controller = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "downloading" | "failed" | "done"
  >("idle");

  const startDownload = async () => {
    controller.current = new AbortController();
    setStatus("downloading");
    setProgress(0);

    try {
      await downloadBatch(
        urls,
        (p: number) => setProgress(p),
        controller.current.signal,
      );

      setStatus("done");
    } catch (error: unknown) {
      // --- Correct type narrowing without using "any" ---
      if (
        axios.isCancel(error) ||
        (typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name: string }).name === "CanceledError")
      ) {
        // user cancelled — do nothing
        setStatus("idle");
        return;
      }

      // actual failure
      setStatus("failed");
    }
  };
  const cancelDownload = () => {
    controller.current?.abort();
    setStatus("idle");
  };
  if (progress === 100) {
    return null;
  }
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 top-1/2 shadow-md -translate-y-1/2 rouned-full p-2 z-20 rounded-full cursor-pointer  ${
        isUser
          ? "bg-blue-400 dark:bg-blue-800 text-gray-800 dark:text-gray-100"
          : "bg-gray-200 dark:bg-blk5  text-gray-600 dark:text-gray-300"
      } `}
    >
      {status === "downloading" ? (
        <button className="relative w-12 h-12 rounded-full flex items-center justify-center  cursor-pointer">
          <CircularProgress
            progress={progress}
            size={40}
            stroke={4}
            cancelDownload={cancelDownload}
          />
        </button>
      ) : (
        // ↓ Download Icon
        <button
          onClick={startDownload}
          className="relative w-12 h-12 rounded-full flex items-center justify-center  cursor-pointer"
        >
          {status === "idle" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
