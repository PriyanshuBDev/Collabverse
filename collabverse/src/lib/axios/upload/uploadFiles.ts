import { fileMeta, fileMetadata } from "@/app/interfaces";
import { supabaseBrowser } from "@/lib/supabase/browser";

export const uploadAttachments = async (files: File[], taskId: string) => {
  const supabase = supabaseBrowser();
  const uploads = files.map(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const fileName = `${taskId}-${crypto.randomUUID()}.${ext}`;
    const filePath = `tasks/${fileName}`;
    const { error } = await supabase.storage
      .from("Attachments")
      .upload(filePath, f, {
        cacheControl: "3600",
        contentType: f.type,
      });
    if (error) throw { error, filePath };
    return {
      path: filePath,
      type: f.type,
      size: f.size,
      format: ext ?? "",
      fileName,
      originalName: f.name,
    };
  });
  return Promise.allSettled(uploads);
};

type uploadOptions = {
  file: File;
  folder: string;
  subFolder?: string;
  id: string;
  onProgress: (progress: number) => void;
};

export const uploadFileXHR = async ({
  file,
  folder,
  subFolder,
  id,
  onProgress,
}: uploadOptions) => {
  const supabase = supabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  const xhr = new XMLHttpRequest();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const fileId = crypto.randomUUID();
  const fileName = `${fileId}.${ext}`;
  const path = subFolder
    ? `${subFolder}/${id}/${fileName}`
    : `${id}/${fileName}`;
  const promise = new Promise<fileMetadata>((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${folder}/${path}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve({
          id: fileId,
          path,
          type: file.type,
          size: file.size,
          format: file.name.split(".").pop() ?? "",
          fileName: path.split("/").pop()!,
          originalName: file.name,
        });
      } else {
        reject(xhr.responseText);
      }
    };
    xhr.onerror = () => reject("Upload failed");
    xhr.onabort = () => reject("Upload cancelled");
    xhr.send(file);
  });
  return {
    promise,
    cancel: () => xhr.abort(),
  };
};

export const uploadFilesBatch = async (
  files: fileMeta[],
  folder: string,
  id: string,
  onProgress: (progress: number) => void,
  subFolder?: string,
) => {
  const supabase = supabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  const controllers: XMLHttpRequest[] = [];

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  let uploadedBytes = 0;

  const uploads = files.map((file: fileMeta) => {
    const xhr = new XMLHttpRequest();
    controllers.push(xhr);

    const ext = file.file.name.split(".").pop()?.toLowerCase();
    const fileName = `${file.id}.${ext}`;
    const path = subFolder
      ? `${subFolder}/${id}/${fileName}`
      : `${id}/${fileName}`;
    const promise = new Promise<fileMetadata>((resolve, reject) => {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${folder}/${path}`;

      xhr.open("POST", url, true);

      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      xhr.setRequestHeader(
        "Content-Type",
        file.file.type || "application/octet-stream",
      );
      xhr.setRequestHeader("x-upsert", "true");
      let lastLoaded = 0;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const delta = e.loaded - lastLoaded;
          lastLoaded = e.loaded;

          uploadedBytes += delta;

          const percent = (uploadedBytes / totalSize) * 100;
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve({
            id: file.id,
            path,
            type: file.file.type,
            size: file.file.size,
            format: ext ?? "",
            fileName,
            originalName: file.file.name,
          });
        } else {
          reject(xhr.responseText);
          console.log(xhr.status);
          console.log(xhr.responseText);
        }
      };
      xhr.onerror = () => reject("Upload failed");
      xhr.onabort = () => reject("Upload cancelled");

      xhr.send(file.file);
    });

    return promise;
  });

  return {
    promise: Promise.allSettled(uploads),
    cancel: () => controllers.forEach((c) => c.abort()),
  };
};
