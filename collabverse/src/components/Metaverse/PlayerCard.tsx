import { WorldPlayer } from "@/app/interfaces";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import Image from "next/image";
import { VoiceCallSvg } from "../svg/VoiceCallSvg";
import { VideoCallSvg } from "../svg/VideoCallSvg";
import { useCallContext } from "../wrappers/CallProvider";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export function PlayerCard({
  player,
  isOpen,
  index,
}: {
  player: WorldPlayer;
  isOpen: boolean;
  index: number;
}) {
  const { startCall } = useCallContext();
  const setUserId = useShowUserStore.getState().setUserId;
  return (
    <div
      key={player.playerId}
      style={{ transitionDelay: isOpen ? `${index * 35}ms` : "0ms" }}
      className={`group relative flex items-center gap-3 overflow-hidden border-2 border-[#354565] bg-[#1b2940] p-2.5 text-[#f4edd8] shadow-[0_4px_0_#111827] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#94abd2] hover:bg-[#263854] hover:shadow-[0_5px_0_#111827] ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#8fa9d4]/25" />

      <div
        className="relative shrink-0 border-2 border-[#8fa9d4] bg-[#111c2d] p-0.5 shadow-[2px_2px_0_#101827] cursor-pointer"
        onClick={() => setUserId(player.playerId)}
      >
        {player.avatar ? (
          <div className="relative h-9 w-9 overflow-hidden">
            <Image
              alt={`${player.name}'s avatar`}
              src={player.avatar}
              className="object-cover"
              fill
              sizes="36px"
            />
          </div>
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center text-xs font-black text-white"
            style={{ background: gradientBgFromName(player.name) }}
          >
            {getInitials(player.name)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="truncate text-sm font-bold text-white lg:text-base hover:underline cursor-pointer"
          onClick={() => setUserId(player.playerId)}
        >
          {player.name}
        </div>
        <div
          className="truncate text-xs text-blue-500 cursor-pointer"
          onClick={() => setUserId(player.playerId)}
        >
          {player.username}
        </div>
      </div>

      {player.dnd ? (
        <span
          aria-label="Do not disturb"
          title="Do not disturb"
          className="flex gap-3 h-8 w-8 shrink-0 items-center justify-center border-2 border-[#b85866] bg-[#692f42] text-[#ffd4ce] shadow-[2px_2px_0_#321d32]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </span>
      ) : player.inCall ? (
        <span
          aria-label="Do not disturb"
          title="Do not disturb"
          className="flex gap-3 h-8 w-8 shrink-0 items-center justify-center border-2 border-[#5687bd] bg-[#263f63] text-[#c8e0ff] shadow-[2px_2px_0_#321d32]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
            User is currently busy
          </svg>
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Start voice call with ${player.name}`}
            title="Voice call"
            onClick={() => {
              startCall(
                { id: player.playerId, ...player },
                "Voice",
                "Flowspace",
              );
            }}
            className="flex h-9 w-9 items-center justify-center border-2 border-[#8de0c0] bg-[#28785f] text-white shadow-[2px_2px_0_#163d3d] transition hover:-translate-y-0.5 hover:bg-[#359875] active:translate-y-0 active:shadow-none"
          >
            <VoiceCallSvg size="size-4 lg:size-5" />
          </button>

          <button
            type="button"
            aria-label={`Start video call with ${player.name}`}
            title="Video call"
            onClick={() => {
              startCall(
                { id: player.playerId, ...player },
                "Video",
                "Flowspace",
              );
            }}
            className="flex h-9 w-9 items-center justify-center border-2 border-[#f1cf88] bg-[#a86b35] text-white shadow-[2px_2px_0_#58392e] transition hover:-translate-y-0.5 hover:bg-[#c18343] active:translate-y-0 active:shadow-none"
          >
            <VideoCallSvg size="size-4 lg:size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
