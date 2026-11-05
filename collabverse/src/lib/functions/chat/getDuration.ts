import { MessageType } from "@prisma/client";

export default function getDuration(
  url?: string,
  type?: MessageType,
): Promise<number | undefined> {
  return new Promise((resolve) => {
    if (!url || !type) return resolve(undefined);

    if (type === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve(video.duration);

        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      };

      video.onerror = () => resolve(undefined);

      video.src = url;
    } else if (type === "audio") {
      const audio = new Audio();
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        resolve(audio.duration);

        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      };

      audio.onerror = () => resolve(undefined);

      audio.src = url;
    } else {
      resolve(undefined);
    }
  });
}
