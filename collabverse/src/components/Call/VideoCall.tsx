"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "../helpers/Toolbar";
import { CallState, memberProps } from "@/app/interfaces";
import { formatDuration } from "@/lib/hooks/useDuration";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { CallingSound } from "./CallingSound";
import { HangupDarkSvg } from "../svg/HangupSvg";
import { useCallContext } from "../wrappers/CallProvider";

export function VideoCall({
  active,
  user,
}: {
  active: boolean;
  user: memberProps;
}) {
  const {
    callDuration,
    callState,
    localStream,
    remoteStream,
    hangup,
    isCameraEnabled,
    isMuted,
    isScreenSharing,
    handleCameraToggle,
    handleMute,
    screenShare,
    callEndReason,
    showError,
  } = useCallContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [switchStream, setSwitchStream] = useState(false);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, switchStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, switchStream, callState]);
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-1000 ${
        active ? "visible" : "invisible pointer-events-none"
      }`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {callState === CallState.CONNECTED ? (
          <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-3xl px-5 pt-5">
            <video
              ref={switchStream ? localVideoRef : remoteVideoRef}
              autoPlay
              muted={switchStream}
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className=" flex flex-col items-center justify-center w-full h-[80vh] pt-[15vh]">
            <div className="w-fit ">
              {user.avatar ? (
                <div
                  className="relative lg:w-30 lg:h-30 md:w-25 md:h-25 w-15 h-15 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                  onClick={() => {}}
                >
                  <Image
                    alt={"UserAvatar"}
                    src={user.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`lg:w-30 lg:h-30 md:w-25 md:h-25 w-15 h-15 rounded-full flex justify-center items-center cursor-pointer`}
                  style={{ background: gradientBgFromName(user.name) }}
                  onClick={() => {}}
                >
                  <div className="font-semibold text-2xl md:3xl lg:text-5xl text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
              )}
            </div>
            <div className="text-gray-900 dark:text-gray-100 font-semibold lg:text-2xl md:text-xl">
              {user.name}
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-semibold text-xs lg:text-sm">
              {user.username}
            </div>
            <div
              className={`  text-gray-600 dark:text-gray-400 text-sm transition-all duration-300 lg:text-2xl md:text-xl  `}
            >
              {callState === CallState.IDLE ? (
                callEndReason
              ) : (
                <>
                  <span>
                    {callState === CallState.CONNECTING
                      ? "Connecting"
                      : callState === CallState.RINGING
                        ? "Ringing"
                        : callState === CallState.CALLING
                          ? "Calling"
                          : ""}{" "}
                  </span>{" "}
                  <span className="inline-flex text-lg">
                    <span className="animate-pulse ">.</span>
                    <span className="animate-pulse [animation-delay:200ms]">
                      .
                    </span>
                    <span className="animate-pulse [animation-delay:400ms]">
                      .
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        <div
          className={`w-full h-15vh p-2 flex items-center justify-between relative`}
        >
          {showError && (
            <div className="absolute left-1/2 -top-10 -translate-x-1/2 rounded-full px-3 bg-red-300 text-red-500 text-xs lg:text-sm flex items-center gap-2 py-[1px] border border-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-2 lg:size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              {showError}
            </div>
          )}
          <>
            <div className="w-full h-full flex flex-col gap-[2vh] items-center justify-center pl-[16vw]">
              <div
                className={`  text-gray-600 dark:text-gray-400 text-sm transition-all duration-300 lg:text-2xl md:text-xl  `}
              >
                {callState === CallState.CONNECTED
                  ? formatDuration(callDuration)
                  : ""}
              </div>
              <div className="flex w-full  gap-[1vw] justify-center items-center ">
                <div
                  className="rounded-full relative group flex items-center justify-center  bg-gray-200  border border-white/10 w-16 h-16 text-black shadow-xl hover:bg-gray-400 cursor-pointer transition-all"
                  onClick={async () => {
                    await handleMute();
                  }}
                >
                  {isMuted ? (
                    <svg
                      className="w-8 h-8 text-gray-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        strokeWidth={1.5}
                        d="M19.97 9.012a1 1 0 1 0-2 0h2Zm-1 2.988 1 .001V12h-1Zm-8.962 4.98-.001 1h.001v-1Zm-3.52-1.46.708-.708-.707.707ZM5.029 12h-1v.001l1-.001Zm3.984 7.963a1 1 0 1 0 0 2v-2Zm5.975 2a1 1 0 0 0 0-2v2ZM7.017 8.017a1 1 0 1 0 2 0h-2Zm6.641 4.862a1 1 0 1 0 .667 1.886l-.667-1.886Zm-7.63-2.87a1 1 0 1 0-2 0h2Zm9.953 5.435a1 1 0 1 0 1 1.731l-1-1.731ZM12 16.979h1a1 1 0 0 0-1-1v1ZM5.736 4.322a1 1 0 0 0-1.414 1.414l1.414-1.414Zm12.528 15.356a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM17.97 9.012V12h2V9.012h-2Zm0 2.987a3.985 3.985 0 0 1-1.168 2.813l1.415 1.414a5.985 5.985 0 0 0 1.753-4.225l-2-.002Zm-7.962 3.98a3.985 3.985 0 0 1-2.813-1.167l-1.414 1.414a5.985 5.985 0 0 0 4.225 1.753l.002-2Zm-2.813-1.167a3.985 3.985 0 0 1-1.167-2.813l-2 .002a5.985 5.985 0 0 0 1.753 4.225l1.414-1.414Zm3.808-10.775h1.992v-2h-1.992v2Zm1.992 0c1.097 0 1.987.89 1.987 1.988h2a3.988 3.988 0 0 0-3.987-3.988v2Zm1.987 1.988v4.98h2v-4.98h-2Zm-5.967 0c0-1.098.89-1.988 1.988-1.988v-2a3.988 3.988 0 0 0-3.988 3.988h2Zm-.004 15.938H12v-2H9.012v2Zm2.988 0h2.987v-2H12v2ZM9.016 8.017V6.025h-2v1.992h2Zm5.967 2.987a1.99 1.99 0 0 1-1.325 1.875l.667 1.886a3.989 3.989 0 0 0 2.658-3.76h-2ZM6.03 12v-1.992h-2V12h2Zm10.774 2.812a3.92 3.92 0 0 1-.823.632l1.002 1.731a5.982 5.982 0 0 0 1.236-.949l-1.415-1.414ZM4.322 5.736l13.942 13.942 1.414-1.414L5.736 4.322 4.322 5.736ZM12 15.98h-1.992v2H12v-2Zm-1 1v3.984h2V16.98h-2Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
                      />
                    </svg>
                  )}
                  <Toolbar top="-top-8" text="text-sm">
                    {isMuted ? "Unmute" : "Mute"}
                  </Toolbar>
                </div>
                <div
                  className="rounded-full relative group flex items-center justify-center  bg-gray-200  border border-white/10 w-16 h-16 text-gray-800 shadow-xl hover:bg-gray-400 cursor-pointer transition-all"
                  onClick={async () => {
                    await handleCameraToggle();
                  }}
                >
                  {isCameraEnabled ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 md:size-5 lg:size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 md:size-5 lg:size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                      />
                    </svg>
                  )}
                  <Toolbar top="-top-8" text="text-sm">
                    {isCameraEnabled ? "Camera Off" : "Camera On"}
                  </Toolbar>
                </div>
                <div
                  className="rounded-full relative group flex items-center justify-center  bg-gray-200  border border-white/10 w-16 h-16 text-gray-800 shadow-xl hover:bg-gray-400 cursor-pointer transition-all"
                  onClick={async () => {
                    await screenShare();
                  }}
                >
                  {isScreenSharing ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 md:size-5 lg:size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 md:size-5 lg:size-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                      />
                    </svg>
                  )}
                  <Toolbar top="-top-8" text="text-sm">
                    {isScreenSharing ? "Unshare Screen" : "Share Screen"}
                  </Toolbar>
                </div>
                <div
                  className="rounded-full  relative group flex items-center justify-center  bg-red-500   w-16 h-16 text-white shadow-xl hover:bg-red-600 cursor-pointer transition-all"
                  onClick={async () => {
                    await hangup();
                  }}
                >
                  <HangupDarkSvg size="size-8" />
                  <Toolbar top="-top-8" text="text-sm">
                    Hang up
                  </Toolbar>
                </div>
              </div>
            </div>
            <video
              onClick={() => setSwitchStream((prev) => !prev)}
              ref={switchStream ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!switchStream}
              className="lg:rounded-xl sm:rounded-lg rounded-md w-[16vw] h-full cursor-pointer"
            />
          </>
        </div>
        <CallingSound callState={callState} />
      </div>
    </div>
  );
}
