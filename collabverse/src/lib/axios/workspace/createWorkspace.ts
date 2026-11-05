import { createWsProps, WorkspacesProps } from "@/app/interfaces";
import uploadAvatar from "@/lib/axios/upload/uploadAvatar";
import api from "@/lib/axios";

export default async function createWorkspace({
  name,
  description,
  avatar,
}: createWsProps) {
  try {
    const res = await api.post<WorkspacesProps>("/api/workspace/create", {
      name,
      description,
    });
    if (avatar) {
      const payload = await uploadAvatar(res.data.id, avatar, "workspaces");
      return { ...res.data, avatar: payload.publicUrl };
    }
    return { ...res.data };
  } catch {
    throw new Error("Something went wrong");
  }
}
