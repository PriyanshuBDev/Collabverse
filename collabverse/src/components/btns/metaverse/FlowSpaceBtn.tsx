"use client";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useRouter } from "next/navigation";
import { useId } from "react";

export const FlowSpaceBtn = () => {
  const id = useId().replace(/:/g, "");
  const router = useRouter();
  const { slug: wsSlug } = useCurrentWorkspace();
  const { slug: pSlug } = useCurrentProject();
  return (
    <button
      type="button"
      aria-label="Enter Flowspace"
      onClick={() => {
        router.push(`/app/${wsSlug}/projects/${pSlug}/flowspace`);
      }}
      className="group relative h-[150px] w-[420px] max-w-full overflow-hidden rounded-[24px] border border-white/25 bg-[#172f2c] text-white shadow-[0_18px_45px_-18px_rgba(10,25,22,.8)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_55px_-16px_rgba(10,25,22,.85),0_0_32px_rgba(144,224,170,.25)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200/60"
    >
      <span className="absolute inset-0 bg-[linear-gradient(160deg,#31594b_0%,#25463d_48%,#172f2c_100%)]" />
      <span className="absolute inset-0 scale-75 bg-[radial-gradient(ellipse_at_50%_48%,rgba(110,235,157,.6),transparent_35%)] opacity-0 transition-all duration-1000 group-hover:scale-150 group-hover:opacity-100" />

      <svg
        aria-hidden="true"
        viewBox="0 0 420 150"
        className="absolute inset-0 h-full w-full origin-[50%_47%] transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[2.35] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <defs>
          <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#c8d8bb" stopOpacity=".72" />
            <stop offset="1" stopColor="#849f83" stopOpacity=".56" />
          </linearGradient>
          <linearGradient id={`${id}-back-cloud`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#edf2df" />
            <stop offset=".7" stopColor="#d3dfcb" />
            <stop offset="1" stopColor="#a9c0aa" />
          </linearGradient>
          <linearGradient id={`${id}-front-cloud`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#fffdf3" />
            <stop offset=".62" stopColor="#f0f1e4" />
            <stop offset="1" stopColor="#cbd9c7" />
          </linearGradient>
          <radialGradient id={`${id}-portal`}>
            <stop stopColor="#f4ffe2" />
            <stop offset=".32" stopColor="#b9f7bd" />
            <stop offset=".7" stopColor="#4dc77f" />
            <stop offset="1" stopColor="#176344" />
          </radialGradient>
          <filter
            id={`${id}-glow`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter
            id={`${id}-spark`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Sky */}
        <path
          d="M42 27h3v3h-3zm76 20h2v2h-2zm242-25h3v3h-3zM74 64h2v2h-2z"
          fill="#f5f1d8"
          opacity=".65"
        />
        <path d="M57 44h7v2h-7zm301 10h7v2h-7z" fill="#c9e7a0" opacity=".8" />

        {/* Distant clouds */}
        <g className="transition-transform duration-1000 group-hover:-translate-x-8">
          <path
            d="M-20 39c0-7 6-13 13-13 3 0 5 1 7 2 3-8 10-13 19-13 11 0 19 8 20 18 2-1 4-2 7-2 7 0 13 6 13 13 0 7-5 12-11 14H-7c-8-2-13-9-13-19Z"
            fill={`url(#${id}-far)`}
          />
          <path
            d="M319 30c0-6 5-11 11-11 2 0 4 1 6 2 3-7 9-11 16-11 10 0 17 7 18 16 2-1 4-1 5-1 6 0 11 5 11 11 0 6-4 10-9 12h-48c-6-1-10-7-10-18Z"
            fill={`url(#${id}-far)`}
          />
          <path
            d="M118 25c0-5 4-9 9-9 2 0 3 0 4 1 2-5 7-8 12-8 7 0 12 5 13 11 1-1 2-1 4-1 5 0 9 4 9 9 0 4-3 8-7 9h-36c-5-1-8-5-8-12Z"
            fill="#dce5cb"
            opacity=".35"
          />
        </g>

        <g className="transition-transform duration-1000 group-hover:translate-x-8">
          <path
            d="M-35 78c0-12 10-22 22-22 4 0 7 1 10 3 5-12 17-20 31-20 16 0 29 12 31 27 3-2 7-3 10-3 12 0 21 9 21 21 0 10-7 18-17 21H-12c-13-3-23-13-23-27Z"
            fill={`url(#${id}-far)`}
            opacity=".85"
          />
          <path
            d="M300 77c0-11 9-20 20-20 3 0 7 1 9 3 5-11 15-18 28-18 15 0 27 11 29 25 3-2 6-2 9-2 11 0 20 9 20 20 0 9-7 17-16 19h-81c-11-2-18-12-18-27Z"
            fill={`url(#${id}-far)`}
            opacity=".85"
          />
        </g>

        {/* Portal glow */}
        <ellipse
          cx="210"
          cy="71"
          rx="52"
          ry="57"
          fill="#65e899"
          opacity=".65"
          filter={`url(#${id}-glow)`}
          className="transition-opacity duration-700 group-hover:opacity-100"
        />
        <ellipse
          cx="210"
          cy="71"
          rx="34"
          ry="43"
          fill="#c8ffb8"
          opacity=".22"
        />

        {/* Portal opening */}
        <path
          d="M184 111V68a26 26 0 0 1 52 0v43z"
          fill={`url(#${id}-portal)`}
        />
        <path d="M190 95h8v-9h6v9h7v-13h7v13h8v-7h6v23h-42z" fill="#347b54" />
        <path d="M194 85h3v-8h3v8zm31 1h3v-9h3v9z" fill="#e7ffd0" />
        <path d="M190 100h42v2h-42z" fill="#e7ffd0" opacity=".9" />
        <path d="M198 105h27v3h-27z" fill="#235a40" opacity=".7" />

        {/* Portal frame */}
        <path
          d="M176 112V68a34 34 0 0 1 68 0v44h-7V68a27 27 0 0 0-54 0v44z"
          fill="#142923"
        />
        <path
          d="M180 110V68a30 30 0 0 1 60 0v42"
          fill="none"
          stroke="#55cf85"
          strokeWidth="5"
        />
        <path
          d="M185 108V69a25 25 0 0 1 50 0v39"
          fill="none"
          stroke="#d7ffd0"
          strokeWidth="2"
          opacity=".9"
        />

        {/* Particles orbit outside the portal */}
        <g
          style={{ transformBox: "view-box", transformOrigin: "210px 71px" }}
          className="animate-[spin_12s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] motion-reduce:animate-none"
        >
          <ellipse
            cx="210"
            cy="71"
            rx="58"
            ry="49"
            fill="none"
            stroke="#d9ffd0"
            strokeWidth="1.5"
            strokeDasharray="1 8"
            opacity=".7"
          />
          <circle cx="152" cy="71" r="3" fill="#fff6cf" />
          <circle cx="268" cy="71" r="2.5" fill="#c9f0a3" />
          <rect x="207" y="19" width="6" height="6" fill="#f3c879" />
          <path d="m206 120 4-4 4 4-4 4z" fill="#d7fff0" />
        </g>

        {/* Glowing particles */}
        <circle
          cx="164"
          cy="48"
          r="5"
          fill="#c8ffdc"
          opacity=".6"
          filter={`url(#${id}-spark)`}
        />
        <circle
          cx="164"
          cy="48"
          r="2"
          fill="#f4ffe2"
          className="animate-ping motion-reduce:animate-none"
        />
        <circle
          cx="256"
          cy="95"
          r="5"
          fill="#b2ffd0"
          opacity=".6"
          filter={`url(#${id}-spark)`}
        />
        <circle
          cx="256"
          cy="95"
          r="2"
          fill="#f4ffe2"
          className="animate-ping motion-reduce:animate-none"
        />

        {/* Two smaller clouds behind the foreground pair */}
        <g transform="translate(116 75)">
          <g className="transition-transform duration-1000 ease-out group-hover:-translate-x-10">
            <g className="motion-safe:animate-[cloud-bob_6s_ease-in-out_infinite]">
              <path
                d="M0 39c0-9 7-16 16-16 3 0 5 1 7 2C27 15 36 9 47 9c13 0 23 9 25 21 2-1 5-2 7-2 9 0 16 7 16 16 0 8-6 15-14 17H15C6 59 0 51 0 39Z"
                fill={`url(#${id}-back-cloud)`}
              />
              <path
                d="M15 34c6-10 14-15 25-15 11 0 20 7 23 16-8-4-15-5-23-2-9 3-16 3-25 1Z"
                fill="white"
                opacity=".5"
              />
            </g>
          </g>
        </g>

        <g transform="translate(210 73)">
          <g className="transition-transform duration-1000 ease-out group-hover:translate-x-10">
            <g className="motion-safe:animate-[cloud-bob_7s_ease-in-out_-2s_infinite]">
              <path
                d="M0 39c0-9 7-16 16-16 3 0 5 1 7 2C27 15 36 9 47 9c13 0 23 9 25 21 2-1 5-2 7-2 9 0 16 7 16 16 0 8-6 15-14 17H15C6 59 0 51 0 39Z"
                fill={`url(#${id}-back-cloud)`}
              />
              <path
                d="M15 34c6-10 14-15 25-15 11 0 20 7 23 16-8-4-15-5-23-2-9 3-16 3-25 1Z"
                fill="white"
                opacity=".5"
              />
            </g>
          </g>
        </g>

        {/* Two larger front clouds, spread toward the edges */}
        <g transform="translate(-10 79) scale(1.35)">
          <g className="transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-x-14">
            <g className="motion-safe:animate-[cloud-bob_6.5s_ease-in-out_-1s_infinite]">
              <path
                d="M0 51c0-13 10-23 23-23 4 0 7 1 10 3C39 16 52 6 69 6c20 0 35 14 37 32 3-2 7-3 11-3 13 0 23 10 23 23 0 12-8 21-19 24H22C9 79 0 67 0 51Z"
                fill={`url(#${id}-front-cloud)`}
              />
              <path
                d="M17 42c9-16 22-24 39-24 17 0 31 10 36 25-12-7-23-8-35-4-14 5-25 5-40 3Z"
                fill="white"
                opacity=".72"
              />
            </g>
          </g>
        </g>

        <g transform="translate(238 79) scale(1.35)">
          <g className="transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-14">
            <g className="motion-safe:animate-[cloud-bob_7s_ease-in-out_-2.5s_infinite]">
              <path
                d="M0 51c0-13 10-23 23-23 4 0 7 1 10 3C39 16 52 6 69 6c20 0 35 14 37 32 3-2 7-3 11-3 13 0 23 10 23 23 0 12-8 21-19 24H22C9 79 0 67 0 51Z"
                fill={`url(#${id}-front-cloud)`}
              />
              <path
                d="M17 42c9-16 22-24 39-24 17 0 31 10 36 25-12-7-23-8-35-4-14 5-25 5-40 3Z"
                fill="white"
                opacity=".72"
              />
            </g>
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes cloud-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      <span className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/35 bg-[#19362f]/60 px-4 py-1.5 shadow-lg backdrop-blur-md transition-all duration-500 group-hover:translate-y-4 group-hover:scale-75 group-hover:opacity-0">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c9e7a0] shadow-[0_0_10px_2px_rgba(201,231,160,.8)]" />
        <span className="text-xs font-semibold tracking-[0.24em] text-[#fff8e8]">
          FLOWSPACE
        </span>
      </span>
    </button>
  );
};
