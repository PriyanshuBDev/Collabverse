import api from "@/lib/axios";
import { removeAvatar } from "@/lib/axios/upload/removeAvatar";
import uploadAvatar from "@/lib/axios/upload/uploadAvatar";

export async function updateGroupDetails({
  workspaceId,
  conversationId,
  name,
  description,
  avatarRemoved,
  oldAvatarPath,
  oldAvatarUrl,
  avatar,
}: {
  workspaceId: string;
  conversationId: string;
  name?: string;
  description?: string | null;
  avatar?: File;
  oldAvatarPath?: string;
  avatarRemoved?: boolean;
  oldAvatarUrl?: string;
}) {
  let uploadedAvatar;
  let uploadedAvatarPath;
  if (avatar) {
    const data = await uploadAvatar(
      conversationId,
      avatar,
      "groups",
      workspaceId,
    );
    uploadedAvatar = data.publicUrl;
    uploadedAvatarPath = data.uploadedPath;
  } else if (avatarRemoved && oldAvatarPath) {
    await removeAvatar({
      type: "groups",
      path: oldAvatarPath,
      typeId: conversationId,
    });
  }
  if (name || description !== undefined) {
    await api.patch(
      `/api/workspace/${workspaceId}/conversation/${conversationId}/group/patch`,
      {
        name,
        description,
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
