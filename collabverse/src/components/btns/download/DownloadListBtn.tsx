import { useRef, useState } from "react";
import { CircularProgress } from "../../progress/CircularProgress";
import { downloadBatch } from "@/lib/functions/download/downloadBatch";
import axios from "axios";

export default function DownloadListBtn({ urls }: { urls: string[] }) {
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
      console.log(error);
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
    <li
      className={`lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8  rounded-md flex items-center gap-2 ${
        status === "done" ? "" : "cursor-pointer"
      }`}
      onClick={() => {
        if (status === "idle" || status === "failed") {
          startDownload();
        }
        if (status === "downloading") {
          cancelDownload();
        }
        if (status === "done") {
          return;
        }
      }}
    >
      {status === "downloading" ? (
        <>
          <button className="relative w-5 h-5 rounded-full flex items-center justify-center  cursor-pointer">
            <CircularProgress
              progress={progress}
              size={25}
              stroke={2}
              cancelDownload={() => {}}
              svgSize="size-3 lg:size-4"
            />
          </button>
          Downloading
        </>
      ) : status === "done" ? (
        <>
          <div className="w-fit cursor-default">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 lg:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          Downloaded
        </>
      ) : // ↓ Download Icon

      status === "idle" ? (
        <>
          <div className="w-fit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 lg:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          Download
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 lg:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Retry
        </>
      )}
    </li>
  );
}
