import { getVideoThumb } from "@/lib/functions/chat/getVideoThumb";
import { useEffect, useRef, useState } from "react";

export default function VideoPreview({
  src,
  size,
  svgSize,
  onClick,
  small,
  index,
  i,
  refresh,
}: {
  src: string;
  size: string;
  svgSize: string;
  onClick?: () => void;
  small?: boolean;
  index?: number;
  i?: number;
  refresh?: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const handleFetchingPoster = async () => {
      const pos = await getVideoThumb(src);
      setPoster(pos);
    };
    handleFetchingPoster();
  }, [src]);

  const handlePlay = () => {
    if (small) return;
    if (onClick) return;
    if (!videoRef.current) return;
    videoRef.current.play();
    setPlaying(true);
  };
  useEffect(() => {
    if (index === undefined || i === undefined) return;
    const video = videoRef.current;
    if (!video) return;

    const playWhenReady = async () => {
      try {
        await video.play();
        setPlaying(true);
      } catch {}
    };

    if (index === i) {
      if (video.readyState >= 1) {
        playWhenReady();
      } else {
        video.addEventListener("loadedmetadata", playWhenReady, { once: true });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
    }
  }, [index, i]);

  return (
    <div
      className={`relative ${size}  overflow-hidden  ${
        small ? "" : " rounded-xl"
      } `}
      onClick={onClick}
    >
      <video
        preload="metadata"
        playsInline
        ref={videoRef}
        src={src}
        poster={poster}
        onSeeking={() => setIsSeeking(true)}
        onSeeked={() => setIsSeeking(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          if (!isSeeking) {
            setPlaying(false);
          }
        }}
        controls={onClick ? false : true}
        className={`w-full h-full  ${
          onClick ? "object-cover" : "object-contain"
        }`}
        onError={async () => {
          if (!refresh) return;
          await refresh();
        }}
      />

      {/* Play button overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all ">
          <button
            className={`bg-gray-700/50  rounded-full cursor-pointer  text-gray-200 ${
              small ? "p-0.5" : "p-3 shadow-xl"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`${svgSize}`}
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
