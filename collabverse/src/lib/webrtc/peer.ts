import { ICE_SERVERS } from "../constants/constants";
import { stopStream } from "./media";

export function createPeer() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
}
export function registerIceCandidateHandler(
  pc: RTCPeerConnection,
  sendCandidate: (candidate: RTCIceCandidate) => Promise<void>,
) {
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    sendCandidate(event.candidate);
  };
}
export async function createOffer(pc: RTCPeerConnection) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}
export async function createAnswer(pc: RTCPeerConnection) {
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function setRemoteDescription(
  pc: RTCPeerConnection,
  description: RTCSessionDescriptionInit,
) {
  await pc.setRemoteDescription(description);
}
export async function addIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
) {
  try {
    await pc.addIceCandidate(candidate);
  } catch (error) {
    console.error("Failed to add ICE candidate:", error);
  }
}
export async function closePeer(
  pc: RTCPeerConnection,
  localStream: MediaStream | null,
) {
  stopStream(localStream);
  pc.close();
}
export async function replaceTrack(
  pc: RTCPeerConnection,
  kind: "audio" | "video",
  newTrack: MediaStreamTrack,
) {
  const sender = pc
    .getSenders()
    .find((sender: RTCRtpSender) => sender.track?.kind === kind);
  if (!sender) {
    throw new Error(`No ${kind} sender found.`);
  }
  await sender.replaceTrack(newTrack);
}
export function restartIce(pc: RTCPeerConnection) {
  pc.restartIce();
}
