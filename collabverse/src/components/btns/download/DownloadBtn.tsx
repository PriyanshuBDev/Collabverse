import { useRef, useState } from "react";
import axios from "axios";
import { downloadWithProgress } from "@/lib/functions/download/downloadWithProgress";
import { CircularProgress } from "@/components/progress/CircularProgress";
import Toolbar from "@/components/helpers/Toolbar";
import { toast } from "sonner";

export default function DownloadBtn({
  handleSignedUrl,
}: {
  handleSignedUrl: () => Promise<string | undefined>;
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
      const url = await handleSignedUrl();
      if (!url) {
        setStatus("failed");
        setProgress(0);
        return;
      }
      await downloadWithProgress(
        url,
        (p: number) => {
          setProgress(p);
        },
        controller.current.signal,
      );

      setStatus("done");
    } catch (error: unknown) {
      if (axios.isCancel(error) || controller.current?.signal.aborted) {
        setStatus("idle");
        setProgress(0);
        return;
      }
      setStatus("failed");
      setProgress(0);
      toast.error("Failed to download attachment");
      return;
    }
  };
  const cancelDownload = () => {
    controller.current?.abort();
    setStatus("idle");
  };

  return (
    <div
      className={`group relative shadow-md  rouned-full p-2 z-20 rounded-full cursor-pointer "bg-gray-200 dark:bg-blk5  text-gray-600 dark:text-gray-300 `}
    >
      {status === "downloading" ? (
        <button className="relative w-4 h-4 rounded-full flex items-center justify-center  cursor-pointer">
          <CircularProgress
            progress={progress}
            size={20}
            stroke={2}
            svgSize="size-3"
            cancelDownload={cancelDownload}
          />
        </button>
      ) : status === "done" ? (
        <div className="w-4 h-4 rounded-full flex items-center justify-center">
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
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
      ) : (
        // ↓ Download Icon
        <button
          onClick={startDownload}
          className="relative w-4 h-4 rounded-full flex items-center justify-center  cursor-pointer"
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
      <Toolbar top="-top-8">
        {status === "idle"
          ? "Download"
          : status === "done"
            ? "Downloaded"
            : status === "downloading"
              ? "Downloading"
              : "Retry"}
      </Toolbar>
    </div>
  );
}
