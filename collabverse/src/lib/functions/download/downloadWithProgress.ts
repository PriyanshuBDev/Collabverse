"use client";
import api from "@/lib/axios";

export async function downloadWithProgress(
  url: string,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
) {
  let res;
  try {
    res = await api.get(url, {
      responseType: "blob",
      signal,
      withCredentials: false,
      onDownloadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        );
        onProgress(percent);
      },
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new Error("Download failed");
  }
  if (signal?.aborted) {
    return;
  }
  const blob = new Blob([res.data], {
    type: res.data.type || "application/octet-stream",
  });
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;

  // Force a proper filename
  const fileName = url.split("/").pop() || "file";
  a.download = fileName;

  // Append, click, remove
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revoke after a delay
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  return res.data;
}
