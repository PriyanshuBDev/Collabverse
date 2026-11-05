export async function getCameraAndMic() {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
}
export async function getMic() {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
}
export async function getScreenShare() {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
}
export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
