import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { useCallContext } from "../wrappers/CallProvider";
import { createPortal } from "react-dom";
import { VideoCall } from "./VideoCall";
import { VoiceCall } from "./VoiceCall";

export function AcceptedCallScreens() {
  const { callMode } = useCallContext();
  const remoteUserData = useCallStore((s) => s.remoteUserData);
  const isAccepted = useCallStore((s) => s.isAccepted);
  if (!isAccepted || !remoteUserData) return null;
  return (
    <>
      {" "}
      {callMode === "Voice" &&
        createPortal(<VoiceCall user={remoteUserData} />, document.body)}
      {callMode === "Video" &&
        createPortal(
          <VideoCall active={callMode === "Video"} user={remoteUserData} />,
          document.body,
        )}
    </>
  );
}
