import api from "../..";
import { removeAvatar } from "../../upload/removeAvatar";
import uploadAvatar from "../../upload/uploadAvatar";

export async function patchProject({
  workspaceId,
  projectId,
  name,
  description,
  dueDate,
  avatar,
  avatarRemoved,
  oldAvatarPath,
  oldAvatarUrl,
}: {
  workspaceId: string;
  projectId: string;
  name?: string;
  description?: string | null;
  dueDate?: Date | null;
  avatar?: File;
  avatarRemoved: boolean;
  oldAvatarPath?: string;
  oldAvatarUrl?: string;
}) {
  let uploadedAvatar;
  let uploadedAvatarPath;
  if (avatar) {
    const data = await uploadAvatar(projectId, avatar, "projects", workspaceId);
    uploadedAvatar = data.publicUrl;
    uploadedAvatarPath = data.uploadedPath;
  } else if (avatarRemoved && oldAvatarPath) {
    await removeAvatar({
      type: "projects",
      path: oldAvatarPath,
      typeId: projectId,
      workspaceId,
    });
  }
  if (name || description !== undefined || dueDate !== undefined) {
    await api.patch(
      `/api/workspace/${workspaceId}/projects/${projectId}/patch`,
      {
        name,
        description,
        dueDate,
      },
    );
  }
  return {
    avatar: avatar ? uploadedAvatar : avatarRemoved ? undefined : oldAvatarUrl,
    avatarPath: avatar
      ? uploadedAvatarPath
      : avatarRemoved
        ? undefined
        : oldAvatarPath,
  };
}
