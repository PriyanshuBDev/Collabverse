import getInitials from "@/lib/functions/user/getInitials";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useMutateAppearance } from "@/lib/queries/user/appearance/useMutateAppearance";
import { useSetMusicLevel } from "@/lib/queries/user/appearance/useSetMusicLevel";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type FlowSpaceSettingsProps = {
  musicLevel: number; // 0–5

  isDnd: boolean;
};
const MAX_AUDIO_VOLUME = 0.3;
type musicTrackProp = {
  id: string;
  label: string;
  src: string;
};
const MUSIC_TRACKS: musicTrackProp[] = [
  { id: "7pm", label: "Wake Up", src: "/audioTracks/7pm.wav" },
  { id: "Dunes", label: "By The Dunes", src: "/audioTracks/Dunes.wav" },
  { id: "BirdSong", label: "Nightangle", src: "/audioTracks/BirdSong.wav" },
  { id: "Brain", label: "Empty Space", src: "/audioTracks/Brain.wav" },
  { id: "goodbye", label: "See You", src: "/audioTracks/goodbye.wav" },
  { id: "Dragon", label: "Free Wind", src: "/audioTracks/Dragon.wav" },
  {
    id: "Observatory",
    label: "Ordinary Wave",
    src: "/audioTracks/Observatory.wav",
  },
  { id: "Rainy", label: "Droplets", src: "/audioTracks/Rainy.wav" },
  { id: "Summer2", label: "Heat", src: "/audioTracks/Summer2.wav" },
  { id: "Tapered", label: "Deep Thoughts", src: "/audioTracks/Tapered.wav" },
] as const;
type TrackId = (typeof MUSIC_TRACKS)[number]["id"];
export function FlowSpaceSettings({
  musicLevel,
  isDnd,
}: FlowSpaceSettingsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId | null>("7pm");
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false);
  const [volume, setVolume] = useState(musicLevel);
  const [dnd, setDnd] = useState(isDnd);
  const { mutateDnd } = useMutateAppearance();
  const playRequestRef = useRef(0);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const debouncedVolume = useDebounce(volume, 300);
  const { mutate: saveMusicLevel } = useSetMusicLevel();
  const volumeStyle = {
    "--volume-progress": `${(volume / 5) * 100}%`,
  } as CSSProperties;
  useEffect(() => {
    setDnd(isDnd);
  }, [isDnd]);

  useEffect(() => {
    setVolume(musicLevel);
  }, [musicLevel]);

  useEffect(() => {
    if (debouncedVolume === musicLevel) return;
    saveMusicLevel(debouncedVolume);
  }, [debouncedVolume, musicLevel, saveMusicLevel]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.min(1, Math.max(0, (volume / 5) * MAX_AUDIO_VOLUME));
  }, [volume]);

  const playTrack = useCallback(
    async (track: (typeof MUSIC_TRACKS)[number]) => {
      const audio = audioRef.current;
      if (!audio) return;

      const request = ++playRequestRef.current;
      setSelectedTrackId(track.id);

      const nextSrc = new URL(track.src, document.baseURI).href;

      if (audio.currentSrc !== nextSrc) {
        audio.pause();
        audio.src = track.src; // Setting src starts the load.
      }

      audio.volume = (volumeRef.current / 5) * MAX_AUDIO_VOLUME;

      try {
        await audio.play();
        if (request === playRequestRef.current) setNeedsAudioGesture(false);
      } catch (error) {
        // A newer track selection can interrupt the previous play request.
        if (request !== playRequestRef.current) return;

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setNeedsAudioGesture(true);
        } else if (
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.error(`Could not play ${track.src}`, error);
        }
      }
    },
    [],
  );
  useEffect(() => {
    const savedId = localStorage.getItem("flowspace-track");
    const track =
      MUSIC_TRACKS.find((item: musicTrackProp) => item.id === savedId) ??
      MUSIC_TRACKS[0];

    void playTrack(track);
  }, [playTrack]);
  async function selectTrack(track: (typeof MUSIC_TRACKS)[number]) {
    localStorage.setItem("flowspace-track", track.id);
    void playTrack(track);
  }
  return (
    <div
      className="group absolute left-3 top-3 z-[1100]"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          event.currentTarget.dataset.hovered = "true";
        }
      }}
      onPointerLeave={(event) => {
        delete event.currentTarget.dataset.hovered;
      }}
      onMouseLeave={(event) => {
        delete event.currentTarget.dataset.hovered;
      }}
    >
      {needsAudioGesture && (
        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;

            void audio
              .play()
              .then(() => setNeedsAudioGesture(false))
              .catch((error) => {
                console.error("Could not start ambience:", error);
              });
          }}
          className="mt-2 w-full rounded border-2 border-emerald-300 bg-emerald-950 px-2 py-2 font-mono text-xs text-emerald-200 hover:bg-emerald-900"
        >
          Enable ambience
        </button>
      )}
      <audio ref={audioRef} loop preload="none" />
      <button
        type="button"
        aria-label="FlowSpace settings"
        aria-expanded={undefined}
        className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-500 bg-blk3/95 text-white shadow-[2px_2px_0_#000] hover:border-emerald-300 focus-visible:outline-2 focus-visible:outline-white"
      >
        <SettingsIcon />
      </button>

      <section
        aria-label="FlowSpace settings"
        className={[
          "invisible pointer-events-none absolute left-full top-0 pl-2 w-64",
          "translate-x-1 rounded-lg border-2 border-slate-500",
          "bg-blk3/95 p-3 text-white opacity-0 shadow-[4px_4px_0_#000]",
          "opacity-0 transition-opacity duration-150",
          "group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100",
        ].join(" ")}
      >
        <div className="mb-4 rounded-md border border-slate-700 bg-blk5/70 p-3">
          <div className="mb-3 flex items-center justify-between">
            <label
              htmlFor="flowspace-volume"
              className="font-mono text-xs text-slate-200"
            >
              Music volume
            </label>

            <span className="min-w-8 border border-emerald-700 bg-emerald-950 px-1.5 py-0.5 text-center font-mono text-xs text-emerald-300">
              {volume}
            </span>
          </div>

          <input
            id="flowspace-volume"
            type="range"
            min={0}
            max={5}
            step={1}
            value={volume}
            aria-valuetext={volume === 0 ? "Muted" : `Level ${volume} of 5`}
            onChange={(event) => {
              setVolume(Number(event.target.value));
            }}
            className="flowspace-volume-slider"
            style={volumeStyle}
          />

          <div
            aria-hidden="true"
            className="mt-1 grid grid-cols-6 font-mono text-[10px] text-slate-500"
          >
            {[0, 1, 2, 3, 4, 5].map((level: number) => (
              <span
                key={level}
                className={
                  level === 0
                    ? "text-left"
                    : level === 5
                      ? "text-right"
                      : "text-center"
                }
              >
                {level}
              </span>
            ))}
          </div>

          <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wide text-slate-500">
            <span>Muted</span>
            <span>Max</span>
          </div>
        </div>
        <div className="mb-3 rounded-md border border-slate-700 bg-blk5/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-200">
              Choose ambience
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {selectedTrackId
                ? MUSIC_TRACKS.find(
                    (track: musicTrackProp) => track.id === selectedTrackId,
                  )?.label
                : "Select a track"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {MUSIC_TRACKS.map((track: musicTrackProp) => {
              const selected = selectedTrackId === track.id;

              return (
                <button
                  key={track.id}
                  type="button"
                  aria-label={`Play ${track.label} ambience`}
                  aria-pressed={selected}
                  onClick={() => selectTrack(track)}
                  className={[
                    "min-h-9 rounded border-2 px-1 py-1",
                    "font-mono text-[10px] leading-tight",
                    "shadow-[2px_2px_0_#000] transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-white",
                    selected
                      ? "border-emerald-300 bg-emerald-950 text-emerald-200"
                      : "border-slate-600 bg-blk4 text-slate-200 hover:border-emerald-300 hover:bg-slate-700",
                  ].join(" ")}
                >
                  {getInitials(track.label)}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={dnd}
          onClick={() => {
            setDnd(!dnd);
            mutateDnd.mutate();
          }}
          className={[
            "flex w-full items-center gap-2 rounded border-2 px-2 py-2",
            "font-mono text-xs transition-colors",
            dnd
              ? "border-red-400 bg-red-950/60 text-red-200"
              : "border-slate-600 bg-blk4 hover:border-blk6",
          ].join(" ")}
        >
          <DndIcon />
          <span>Do not disturb</span>
          <span className="ml-auto">{dnd ? "On" : "Off"}</span>
        </button>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
          When enabled, FlowSpace calls will be ignored. Other calls are
          unaffected.
        </p>
      </section>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function DndIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 18 12-12" />
    </svg>
  );
}
