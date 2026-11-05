import { CallState } from "@/app/interfaces";
import { useEffect, useRef } from "react";

export function CallingSound({ callState }: { callState: CallState }) {
  const callStartAudioRef = useRef<HTMLAudioElement>(null);
  const callBeepAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const callingAudio = callStartAudioRef.current;
    const beepAudio = callBeepAudioRef.current;

    if (!callingAudio || !beepAudio) return;
    if (callState === CallState.CONNECTED) {
      beepAudio.currentTime = 0;
      beepAudio?.play().catch(() => {});
    }
    if (callState === CallState.CALLING || callState === CallState.RINGING) {
      callingAudio.currentTime = 0;
      callingAudio.play().catch(() => {});
    } else {
      callingAudio.pause();
      callStartAudioRef.current!.currentTime = 0;
    }
  }, [callState]);
  return (
    <>
      <audio
        ref={callStartAudioRef}
        src="/sounds/callingSound.mp3"
        loop
        preload="auto"
      />
      <audio ref={callBeepAudioRef} src="/sounds/callBeep.mp3" preload="auto" />
    </>
  );
}
