import { $Enums } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import fixWebmDuration from "fix-webm-duration";
export function useAudioRecorder(
  setmsgType: Dispatch<SetStateAction<$Enums.MessageType>>,
) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const shouldSaveRef = useRef(true);
  const startTimeRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const [recorderState, setRecorderState] =
    useState<RecordingState>("inactive");
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;

      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 200);
  };
  const start = async () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      return;
    }
    if (!recorderRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      recorderRef.current = new MediaRecorder(stream, { mimeType });
      streamRef.current = stream;
      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
    }
    startTimeRef.current = Date.now();
    setElapsed(0);
    accumulatedRef.current = 0;
    startTimer();
    chunks.current.length = 0;
    recorderRef.current.start(1000);
    setRecorderState("recording");
    setmsgType("audio");
    shouldSaveRef.current = true;
  };

  const release = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedRef.current = 0;
    startTimeRef.current = null;
    setElapsed(0);
    chunks.current.length = 0;
    streamRef.current = null;
    recorderRef.current = null;
    setRecorderState("inactive");
  };
  const stop = async (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current) {
        resolve(null);
        return;
      }

      shouldSaveRef.current = true;

      recorderRef.current.onstop = async () => {
        if (!shouldSaveRef.current) {
          release();
          resolve(null);
          return;
        }

        const blob = new Blob(chunks.current, {
          type: "audio/webm",
        });
        const fixedBlob = await fixWebmDuration(blob, elapsed);
        const file = new File([fixedBlob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        release();
        resolve(file);
      };

      if (
        recorderRef.current.state === "recording" ||
        recorderRef.current.state === "paused"
      ) {
        recorderRef.current.stop();
      }
    });
  };
  const pause = () => {
    if (!recorderRef.current) return;
    if (recorderRef.current.state === "recording") {
      recorderRef.current.pause();
      setRecorderState("paused");
    }
    accumulatedRef.current += Date.now() - startTimeRef.current!;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const resume = () => {
    if (!recorderRef.current) return;
    if (recorderRef.current.state === "paused") {
      recorderRef.current.resume();
      setRecorderState("recording");
    }
    startTimeRef.current = Date.now();
    startTimer();
  };
  const remove = () => {
    if (!recorderRef.current) return;
    shouldSaveRef.current = false;
    if (recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setmsgType("text");
  };
  const totalSeconds = Math.floor(elapsed / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  useEffect(() => {
    return () => {
      release();
    };
  }, []);
  return {
    start,
    stop,
    pause,
    resume,
    remove,
    formattedTime,
    isRecording: recorderState === "recording",
    isPaused: recorderState === "paused",
  };
}
