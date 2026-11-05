import { DeletableAvatarType } from "@/app/interfaces";
import api from "@/lib/axios";
interface props {
  type: DeletableAvatarType;
  path: string;
  typeId?: string;
  workspaceId?: string;
}
export async function removeAvatar({ type, path, typeId, workspaceId }: props) {
  try {
    await api.post("/api/avatar/delete", {
      type,
      path,
      typeId,
      workspaceId,
    });
  } catch {
    throw new Error("Something went wrong");
  }
}
