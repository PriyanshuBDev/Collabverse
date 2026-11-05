"use client";

import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { useCallContext } from "../wrappers/CallProvider";
import { createPortal } from "react-dom";
import { VideoCall } from "./VideoCall";
import { VoiceCall } from "./VoiceCall";

export function CallScreens() {
  const { callMode } = useCallContext();
  const remoteUserData = useCallStore((s) => s.remoteUserData);
  const isAccepted = useCallStore((s) => s.isAccepted);
  const callStarted = useCallStore((s) => s.callStarted);
  if ((!isAccepted && !callStarted) || !remoteUserData) return null;

  return (
    <>
      {" "}
      {remoteUserData &&
        callMode === "Voice" &&
        createPortal(<VoiceCall user={remoteUserData} />, document.body)}
      {remoteUserData &&
        callMode === "Video" &&
        createPortal(
          <VideoCall active={callMode === "Video"} user={remoteUserData} />,
          document.body,
        )}
    </>
  );
}
