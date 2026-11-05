"use client";

import api from "@/lib/axios";
import { toast } from "sonner";
/**
 *
 * @param files - Array of { url: signedUrl, name: originalName } objects
 * @param onProgress - Callback (0–100)
 * @param signal - Optional AbortSignal to cancel all downloads
 */

export async function downloadAll(
  files: { url: string; name: string }[],
  onProgess: (percent: number) => void,
  signal?: AbortSignal,
) {
  const totalFiles = files.length;
  let completedFiles = 0;
  for (const file of files) {
    let res;
    try {
      res = await api.get(file.url, {
        responseType: "blob",
        signal,
        onDownloadProgress: (e) => {
          const fileProgress = e.total ? e.loaded / e.total : 0;
          const combined = (completedFiles + fileProgress) / totalFiles;
          onProgess(Math.floor(combined * 100));
        },
      });
    } catch (e) {
      if (signal?.aborted) throw e;
      toast.error("A file was skipped due to some error.");
      continue;
    }
    if (signal?.aborted) return;

    const mime = res.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([res.data], { type: mime });
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    completedFiles++;
  }
  onProgess(100);
}
