export async function getVideoThumb(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = src;
    video.preload = "auto";

    // Step 1 – wait for metadata (duration, size)
    video.onloadedmetadata = () => {
      // Move to 0.1s to avoid black first-frame
      const targetTime = Math.min(0.1, video.duration / 2);
      video.currentTime = targetTime;
    };

    // Step 2 – wait for actual decoded frame
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas ctx null");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg"));
    };

    video.onerror = () => reject("Can't load video");
  });
}
