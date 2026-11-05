import { useRef, useState } from "react";
import { downloadBatch } from "@/lib/functions/download/downloadBatch";
import axios from "axios";
import { CircularProgress } from "@/components/progress/CircularProgress";

export default function SmallDownloadBtn({
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
  return (
    <div
      className={`  cursor-pointer  ${
        isUser
          ? " text-gray-800 dark:text-gray-100"
          : "  text-gray-600 dark:text-gray-300"
      } `}
    >
      {status === "downloading" ? (
        <button className="relative w-5 h-5 rounded-full flex items-center justify-center  cursor-pointer">
          <CircularProgress
            progress={progress}
            size={20}
            stroke={2}
            cancelDownload={cancelDownload}
            svgSize="size-4"
          />
        </button>
      ) : status === "done" ? (
        <div className="w-fit cursor-default">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
      ) : (
        // ↓ Download Icon
        <button
          onClick={startDownload}
          className="relative w-5 h-5 rounded-full flex items-center justify-center  cursor-pointer"
        >
          {status === "idle" ? (
            <div className="w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
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
