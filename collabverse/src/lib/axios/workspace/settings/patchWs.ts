import api from "../..";
import { removeAvatar } from "../../upload/removeAvatar";
import uploadAvatar from "../../upload/uploadAvatar";

export async function patchWs({
  id,
  name,
  description,
  avatar,
  avatarRemoved,
  oldAvatarPath,
  oldAvatarUrl,
}: {
  id: string;
  name?: string;
  description?: string | null;
  avatar?: File;
  avatarRemoved: boolean;
  oldAvatarPath?: string;
  oldAvatarUrl?: string;
}) {
  let uploadedAvatar;
  let uploadedAvatarPath;
  if (avatar) {
    const data = await uploadAvatar(id, avatar, "workspaces");
    uploadedAvatar = data.publicUrl;
    uploadedAvatarPath = data.uploadedPath;
  } else if (avatarRemoved && oldAvatarPath) {
    await removeAvatar({
      type: "workspaces",
      path: oldAvatarPath,
      typeId: id,
    });
  }
  if (name !== undefined || description !== undefined) {
    await api.patch(`/api/workspace/${id}/settings/patch`, {
      name,
      description,
    });
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
