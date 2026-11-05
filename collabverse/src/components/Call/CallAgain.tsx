"use client";

import { callMode } from "@/app/interfaces";
import Toolbar from "../helpers/Toolbar";
import { VideoCallDarkSvg } from "../svg/VideoCallSvg";
import { VoiceCallDarkSvg } from "../svg/VoiceCallSvg";

export function CallAgain({
  callAction,
  mode,
}: {
  callAction: () => Promise<void>;
  mode: callMode;
}) {
  return (
    <>
      <div
        className="rounded-full relative group flex items-center justify-center  bg-gray-200  border border-white/10 w-16 h-16 text-black shadow-xl hover:bg-gray-400 cursor-pointer transition-all"
        onClick={() => {}}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-8"
        >
          <path
            fillRule="evenodd"
            d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>

        <Toolbar top="-top-8">Cancel</Toolbar>
      </div>

      <div
        className="rounded-full  relative group flex items-center justify-center  bg-green-500   w-16 h-16 text-white shadow-xl hover:bg-green-600 cursor-pointer transition-all"
        onClick={async () => {
          await callAction();
        }}
      >
        {mode === "Video" ? <VideoCallDarkSvg /> : <VoiceCallDarkSvg />}
        <Toolbar top="-top-8">Call Again</Toolbar>
      </div>
    </>
  );
}
