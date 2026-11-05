import api from "@/lib/axios";

export async function downloadBatch(
  urls: string[],
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
) {
  const totalFiles = urls.length;
  let completedFiles = 0;

  for (const url of urls) {
    let res;
    try {
      res = await api.get(url, {
        withCredentials: false,
        responseType: "blob",
        signal,
        onDownloadProgress: (e) => {
          const fileProgress = e.total ? e.loaded / e.total : 0;
          const combined = (completedFiles + fileProgress) / totalFiles;
          onProgress(Math.floor(combined * 100));
        },
      });
    } catch (err) {
      if (signal?.aborted) throw err; // user canceled
      throw new Error("Download failed");
    }

    // 🛑 EVEN IF request already finished,
    // DO NOT save if cancel was triggered.
    if (signal?.aborted) {
      return;
    }

    // ✅ Safe to save
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

    completedFiles++;
  }

  onProgress(100); // done
}
