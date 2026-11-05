import { MessageType } from "@prisma/client";
import { useEffect, useState } from "react";

export function formatDuration(sec: number): string {
  if (!sec || Number.isNaN(sec)) return "00:00";
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function useDuration(
  url: string | undefined,
  type: MessageType | undefined,
) {
  const [duration, setDuration] = useState<string>("");
  useEffect(() => {
    if (!url || !type) return;
    try {
      new URL(url);
    } catch {
      return;
    }

    if (type === "video") {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      video.onloadeddata = () => {
        setDuration(formatDuration(video.duration));
        URL.revokeObjectURL(url);
      };
    } else if (type === "audio") {
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        setDuration(formatDuration(audio.duration));
      });
    }
  }, [url, type]);
  return duration;
}
