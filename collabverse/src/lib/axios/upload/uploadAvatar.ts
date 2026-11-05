import { supabaseBrowser } from "@/lib/supabase/browser";
import api from "@/lib/axios";

interface responseProps {
  avatar: string;
  avatarPath: string;
}
export default async function uploadAvatar(
  id: string,
  file: File,
  pathType: "users" | "groups" | "projects" | "workspaces",
  workspaceId?: string,
) {
  const supabase = supabaseBrowser();
  let uploadedPath: string | null = null;
  let publicUrl: string;

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${id}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${pathType}/${fileName}`;
    const { error } = await supabase.storage
      .from("Avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) throw error;
    uploadedPath = filePath; // after upload success so if the upload fails it won't try to delete it in catch
    const res = await api.post<responseProps>("/api/avatar/upload", {
      id,
      workspaceId,
      type: pathType,
      path: uploadedPath,
    });
    publicUrl = res.data.avatar;
  } catch (e) {
    throw e;
  }
  return { publicUrl, uploadedPath };
}
