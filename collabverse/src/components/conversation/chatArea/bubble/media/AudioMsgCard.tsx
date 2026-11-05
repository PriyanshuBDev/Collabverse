import Spinner1 from "@/components/loadings/Spinner1";
import { DataFormatter } from "@/lib/functions/download/DataFormatter";
import { useEffect, useRef, useState } from "react";

export default function AudioMsgCard({
  src,
  isUser,
  size,
}: {
  src?: string;
  isUser: boolean;
  size: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const loaded = () => setDuration(audio.duration);
    const time = () => setCurrent(audio.currentTime);
    const ended = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("timeupdate", time);
    audio.addEventListener("ended", ended);
    console.log(audio.duration);
    console.log(audio.seekable.length);
    console.log(audio.readyState);
    return () => {
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("timeupdate", time);
      audio.removeEventListener("ended", ended);
    };
  }, []);
  const seekFromTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current || !audioRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrent(pct * duration);
  };

  // Compute percent used for UI
  const progressPct = duration
    ? ((isDragging && dragTime != null ? dragTime : current) / duration) * 100
    : 0;

  // Handle pointer dragging on dot
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (ev: PointerEvent) => {
      if (!trackRef.current || duration === 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const newTime = pct * duration;
      setDragTime(newTime);
    };

    const onUp = (ev: PointerEvent) => {
      if (!trackRef.current || !audioRef.current || duration === 0) {
        setIsDragging(false);
        setDragTime(null);
        return;
      }
      const rect = trackRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const newTime = pct * duration;
      audioRef.current.currentTime = newTime;
      setCurrent(newTime);
      setIsDragging(false);
      setDragTime(null);
    };

    // Attach to window so drag continues if pointer leaves element
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, duration]);

  // Start dragging when pointerdown on dot
  const onDotPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    // initialize drag position immediately
    if (!trackRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = pct * duration;
    setDragTime(newTime);
  };

  // When user releases pointer on dot (in case pointerup fires on dot)
  const onDotPointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (!audioRef.current || !trackRef.current || duration === 0) {
      setIsDragging(false);
      setDragTime(null);
      return;
    }
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setCurrent(newTime);
    setIsDragging(false);
    setDragTime(null);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={`w-[260px] rounded-2xl p-3  flex items-center gap-3 ${
        isUser ? "bg-blue-400 dark:bg-blue-600/80" : "bg-gray-100 dark:bg-blk3"
      }`}
    >
      {/* Play button */}
      {src ? (
        <button
          onClick={togglePlay}
          className=" flex items-center justify-center rounded-full cursor-pointer"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
              />
            </svg>
          )}
        </button>
      ) : (
        <Spinner1 size={"size-8"} />
      )}

      {/* Audio area */}
      <div className="flex-1">
        {/* Seek bar */}
        <div
          ref={trackRef}
          className="relative w-full h-[6px] bg-gray-300/80 dark:bg-gray-700/80 rounded-full cursor-pointer"
          onClick={seekFromTrackClick}
        >
          {/* filled */}
          <div
            className={`absolute left-0 top-0 h-full  rounded-full transition-all ${
              isUser ? "bg-blue-600 dark:bg-blue-300" : "bg-blue-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />

          {/* draggable dot */}
          <div
            ref={dotRef}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(
              isDragging && dragTime != null ? dragTime : current,
            )}
            tabIndex={0}
            onPointerDown={onDotPointerDown}
            onPointerUp={onDotPointerUp}
            className={`absolute -top-1 w-3.5 h-3.5 rounded-full shadow transition-transform transform ${
              isUser ? "bg-blue-50 dark:bg-blue-50" : "bg-blue-500"
            } ${isDragging ? "scale-110" : ""}`}
            style={{
              left: `calc(${progressPct}% - 10px)`,
            }}
          />
        </div>

        {/* Time */}
        <div className="flex justify-between text-xs mt-1 text-gray-700 dark:text-gray-300">
          <span>{DataFormatter(size)}</span>
          <div className="flex items-center gap-0.5">
            {isPlaying && <span>{formatDuration(current)} /</span>}
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
}

export function formatDuration(time: number) {
  if (isNaN(time)) return "0:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
