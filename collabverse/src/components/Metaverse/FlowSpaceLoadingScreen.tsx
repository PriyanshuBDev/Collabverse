"use client";

import { FlowSpaceLoadingBar } from "../loadings/FlowSpaceLoading";

type FlowSpaceLoadingScreenProps = {
  progress: number;
};

export function FlowSpaceLoadingScreen({
  progress,
}: FlowSpaceLoadingScreenProps) {
  return (
    <main
      role="status"
      aria-label={`Loading FlowSpace: ${Math.round(progress)} percent`}
      className="fixed inset-0 z-[2000] overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(7,12,18,.08) 20%, rgba(7,12,18,.35) 60%, rgba(7,12,18,.82) 100%), url('/assets/flowspaceLoading.png')",
      }}
    >
      <div className="absolute bottom-[clamp(20px,5vh,52px)] left-1/2 flex w-max max-w-[94vw] -translate-x-1/2 items-center gap-3  sm:gap-6">
        <FlowSpaceLoadingBar progress={progress} />

        <svg
          aria-hidden="true"
          viewBox="0 0 88 100"
          className="h-[72px] w-[62px] shrink-0 overflow-visible"
        >
          <path className="steam steam-1" d="M26 30c-8-8 8-10 0-20" />
          <path className="steam steam-2" d="M43 28c-8-8 8-10 0-20" />
          <path className="steam steam-3" d="M60 30c-8-8 8-10 0-20" />

          <path
            d="M14 37h48l-4 39c-.8 8-7 13-15 13H33c-8 0-14-5-15-13l-4-39Z"
            fill="white"
          />
          <path
            d="M60 47h7a12 12 0 0 1 0 24h-9"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes steam-rise {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(5px);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }

        .steam {
          fill: none;
          stroke: white;
          stroke-width: 3;
          stroke-linecap: round;
          animation: steam-rise 1.8s ease-in-out infinite;
        }

        .steam-2 {
          animation-delay: 0.45s;
        }

        .steam-3 {
          animation-delay: 0.9s;
        }
      `}</style>
    </main>
  );
}
