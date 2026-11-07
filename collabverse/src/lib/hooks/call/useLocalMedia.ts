import {
  getCameraAndMic,
  getMic,
  getScreenShare,
  stopStream,
} from "@/lib/webrtc/media";
import { RefObject, useState } from "react";
import { useCallStore } from "../zustand/useCallStore";

export function useLocalMedia(
  cameraStreamRef: RefObject<MediaStream | null>,
  screenStreamRef: RefObject<MediaStream | null>,
) {
  const { setMuted, setCameraEnabled } = useCallStore();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const getUserAudio = async () => {
    const existingStream = cameraStreamRef.current;
    if (
      existingStream?.getAudioTracks().some((track) => track.readyState === "live")
    ) {
      return existingStream;
    }
    const stream = await getMic();
    cameraStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };
  const getUserMedia = async () => {
    if (cameraStreamRef.current) return cameraStreamRef.current;
    const stream = await getCameraAndMic();
    cameraStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };
  const stopMedia = () => {
    stopStream(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setLocalStream(null);
  };
  const getUserScreen = async () => {
    const stream = await getScreenShare();
    screenStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };
  const stopScreen = () => {
    stopStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setLocalStream(cameraStreamRef.current);
  };
  const toggleMute = () => {
    const track = cameraStreamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    const muted = !track.enabled;
    setMuted(muted);
    return muted;
  };
  const toggleCamera = () => {
    if (screenStreamRef.current) return;
    const track = cameraStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const enabled = track.enabled;
    setCameraEnabled(enabled);
    return enabled;
  };
  return {
    localStream,
    getUserMedia,
    stopMedia,
    getUserScreen,
    stopScreen,
    toggleCamera,
    toggleMute,
    getUserAudio,
    cameraStreamRef,
    screenStreamRef,
  };
}
