"use client";

import api from "@/lib/axios";
import { toast } from "sonner";

/** New thing i learnt, i can use this for description of parameters
 * @param url - Signed URL from Supabase
 * @param filename - Original filename from DB
 * @param onProgress - Progress callback (0–100)
 * @param signal - Optional AbortSignal to cancel
 */
export async function downloadAndProgress(
  url: string,
  filename: string,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
) {
  let res;
  try {
    res = await api.get(url, {
      responseType: "blob",
      signal,
      onDownloadProgress: (e) => {
        if (!e.total) return;
        const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
        onProgress(percent);
      },
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    toast.error("Download cancelled due to some error");
    throw new Error("Download failed");
  }
  if (signal?.aborted) return;
  const mime = res.headers["content-type"] || "application/octet-stream";
  const blob = new Blob([res.data], { type: String(mime) });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  return res.data;
}
