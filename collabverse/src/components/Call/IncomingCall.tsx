"use client";

import { memberProps } from "@/app/interfaces";
import { getIncomingCall } from "@/lib/axios/workspace/conversation/call/getIncomingCall";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { VideoCallDarkSvg } from "../svg/VideoCallSvg";
import { VoiceCallDarkSvg } from "../svg/VoiceCallSvg";
import { HangupDarkSvg } from "../svg/HangupSvg";
import { useCallContext } from "../wrappers/CallProvider";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";

export function IncomingCall() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { callMode, callId, incomingCall, rejectCall, acceptCall } =
    useCallContext();
  const [active, setActive] = useState(false);
  const [user, setUser] = useState<memberProps>();
  const incomingCallAudioRef = useRef<HTMLAudioElement>(null);
  const setRemoteUserData = useCallStore((s) => s.setRemoteUserData);
  const { user: currentUserData, isLoading } = useUserAppbar();
  const isFlowspace = incomingCall?.space?.trim().toLowerCase() === "flowspace";
  useEffect(() => {
    const callingAudio = incomingCallAudioRef.current;
    if (!callingAudio) return;
    if (!currentUserData || isLoading) return;

    if (active) {
      if (currentUserData.mute) {
        if (isFlowspace) {
          callingAudio.currentTime = 0;
          callingAudio.play().catch(() => {});
        }
      } else {
        callingAudio.currentTime = 0;
        callingAudio.play().catch(() => {});
      }
    } else {
      callingAudio.pause();
      callingAudio.currentTime = 0;
    }
  }, [active, currentUserData, isLoading, isFlowspace]);

  useEffect(() => {
    if (!active || !callId) return;

    const run = async () => {
      try {
        const data = await getIncomingCall({ workspaceId, callId });
        setUser(data.user);
      } catch (e) {
        console.error(e);
        toast.error("Failed to get call data");
      }
    };

    void run();
  }, [active, callId, workspaceId]);

  useEffect(() => {
    setActive(Boolean(incomingCall));
  }, [callId, incomingCall]);

  if (!active || !user || !incomingCall) return null;

  const flowspaceActions = (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="flex items-center justify-center gap-2 border-2 border-[#ffaaa4] bg-[#c94f58] px-4 py-2.5 font-bold text-white shadow-[0_4px_0_#702c3a] transition hover:-translate-y-0.5 hover:bg-[#e15d65] active:translate-y-0 active:shadow-none"
        onClick={async () => {
          await rejectCall();
          setActive(false);
        }}
      >
        <HangupDarkSvg size="size-4 lg:size-5" />
        Reject
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 border-2 border-[#b8f0d0] bg-[#328b69] px-4 py-2.5 font-bold text-white shadow-[0_4px_0_#1c4d47] transition hover:-translate-y-0.5 hover:bg-[#43a87c] active:translate-y-0 active:shadow-none"
        onClick={async () => {
          setRemoteUserData(user);
          await acceptCall();

          setActive(false);
        }}
      >
        {callMode === "Video" ? (
          <VideoCallDarkSvg size="size-4 lg:size-5" />
        ) : (
          <VoiceCallDarkSvg size="size-4 lg:size-5" />
        )}
        Join
      </button>
    </div>
  );

  const workspaceActions = (
    <div className="flex items-center justify-between gap-4 lg:gap-6">
      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/60 bg-red-500/50 px-5 py-2 text-white shadow-[0_4px_20px_rgba(34,197,94,0.15)] backdrop-blur-lg transition hover:bg-red-500/60"
        onClick={async () => {
          await rejectCall();
          setActive(false);
        }}
      >
        <HangupDarkSvg size="size-4 lg:size-5" />
        Reject
      </button>
      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-400/60 bg-green-500/50 px-5 py-2 text-white shadow-[0_4px_20px_rgba(34,197,94,0.15)] backdrop-blur-lg transition hover:bg-green-500/60"
        onClick={async () => {
          setRemoteUserData(user);
          await acceptCall();

          setActive(false);
        }}
      >
        {callMode === "Video" ? (
          <VideoCallDarkSvg size="size-4 lg:size-5" />
        ) : (
          <VoiceCallDarkSvg size="size-4 lg:size-5" />
        )}
        Accept
      </button>
    </div>
  );

  const avatar = user.avatar ? (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-slate-800 shadow-lg">
      <Image
        alt={`${user.name}'s avatar`}
        src={user.avatar}
        className="object-cover"
        fill
      />
    </div>
  ) : (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/70 text-xl font-bold text-white shadow-lg"
      style={{ background: gradientBgFromName(user.name) }}
    >
      {getInitials(user.name)}
    </div>
  );

  return createPortal(
    <div
      className={`fixed bottom-2 right-2 z-[1000] flex items-center justify-center transition-all duration-300 ${
        active
          ? "visible opacity-100"
          : "invisible pointer-events-none opacity-0"
      }`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {isFlowspace ? (
        <section
          aria-label="Incoming Flowspace call"
          className="relative w-[min(22rem,calc(100vw-1rem))] overflow-hidden border-4 border-[#27334b] bg-[#18243a] p-1 text-[#f8f1d6] shadow-[0_8px_0_#111827,0_18px_40px_rgba(0,0,0,0.55)] [image-rendering:pixelated]"
        >
          <div className="border-2 border-[#8393b5] bg-[linear-gradient(180deg,#334768_0%,#263650_42%,#1d2b42_100%)] p-4">
            <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[#8393b5]/70 pb-3">
              <div>
                <h2 className="text-lg font-black leading-none tracking-wide">
                  FLOWSPACE
                </h2>
              </div>
              <span className="animate-pulse rounded-sm border-2 border-[#f6d365] bg-[#e89b3c] px-2 py-1 text-[9px] font-black uppercase text-[#392718]">
                Live
              </span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="relative">
                <span className="absolute -inset-1 border-2 border-dashed border-[#8de0c0]/70" />
                {avatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold">{user.name}</p>
                <p className="truncate text-xs text-[#b8c9e8]">
                  {user.username}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 border-2 border-[#526582] bg-[#111c2d]/70 px-3 py-2 text-xs font-semibold text-[#d3e0f7]">
              <span aria-hidden="true">✦</span>
              <span>
                {callMode === "Video" ? "Video call" : "Voice call"} · Join
                their space?
              </span>
            </div>
            {flowspaceActions}
          </div>
          <div className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 bg-white/70 shadow-[4px_0_#fff,-4px_0_#fff,0_4px_#fff,0_-4px_#fff]" />
        </section>
      ) : (
        <div
          className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:p-5 ${
            active ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <div
            className={`flex items-center ${currentUserData?.mute ? "justify-start" : "justify-between"}`}
          >
            <div className="font-sans text-base font-semibold lg:text-lg">
              WORKSPACE
            </div>
            {currentUserData?.mute && (
              <div className="px-1.5 py-1 rounded-full bg-slate-500 dark:bg-slate-400 text-gray-200 text-xs animate-pulse">
                Silent
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 lg:gap-8">
            {avatar}
            <div className="flex min-w-0 flex-col gap-1 lg:gap-2">
              <div className="truncate font-semibold text-gray-900 dark:text-gray-100 lg:text-xl">
                {user.name}
              </div>
              <div className="truncate text-xs font-semibold text-blue-600 dark:text-blue-400 lg:text-sm">
                {user.username}
              </div>
            </div>
          </div>
          {workspaceActions}
        </div>
      )}
      <audio
        ref={incomingCallAudioRef}
        src="/sounds/callingSound.mp3"
        loop
        preload="auto"
      />
    </div>,
    document.body,
  );
}
