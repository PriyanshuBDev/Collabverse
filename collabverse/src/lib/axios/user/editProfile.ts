import { isZodError } from "@/lib/functions/zod/isZodError";
import api from "@/lib/axios";
import axios from "axios";
import { removeAvatar } from "../upload/removeAvatar";
import { z } from "zod";
import { editProfileSchema } from "@/app/api/user/profile/edit/route";
import uploadAvatar from "../upload/uploadAvatar";
import { editedUserProps, editProfileResponse } from "@/app/interfaces";

type EditProfilePayload = z.infer<typeof editProfileSchema>;
interface props {
  id: string;
  name: string;
  editedName: string;
  username: string;
  editedUsername: string;
  bio: string;
  editedBio: string;
  avatar?: File;
  oldAvatarPath?: string;
  avatarRemoved: boolean;
  oldAvatarUrl?: string;
}

export async function editProfile({
  id,
  name,
  editedName,
  username,
  editedUsername,
  bio,
  editedBio,
  avatar,
  oldAvatarPath,
  avatarRemoved,
  oldAvatarUrl,
}: props) {
  try {
    await api.post("/api/permission/edit", {
      id,
      type: "users",
    });
    let uploadedAvatar: string | undefined = undefined;
    let uploadedAvatarPath: string | undefined = undefined;
    let profileData: editProfileResponse | null = null;
    const payload: EditProfilePayload = {};

    if (editedName !== name) payload.name = editedName;
    if (editedUsername !== username) payload.username = editedUsername;
    if (editedBio !== bio) payload.bio = editedBio;

    const hasProfileChanges = Object.keys(payload).length > 0;
    const hasAvatarChange = !!avatar || avatarRemoved;

    if (!hasProfileChanges && !hasAvatarChange) return;
    if (hasProfileChanges) {
      const res = await api.post<editProfileResponse>(
        "/api/user/profile/edit",
        payload,
      );
      profileData = res.data;
    }
    if (avatar) {
      const data = await uploadAvatar(id, avatar, "users");
      uploadedAvatar = data.publicUrl;
      uploadedAvatarPath = data.uploadedPath;
    }
    if (avatarRemoved && oldAvatarPath && !avatar) {
      await removeAvatar({ type: "users", path: oldAvatarPath });
    }
    return {
      name: profileData?.name ?? name,
      username: profileData?.username ?? username,
      bio: profileData?.bio ?? bio,
      avatar: avatar
        ? uploadedAvatar
        : avatarRemoved
          ? undefined
          : oldAvatarUrl,
      avatarPath: avatar
        ? uploadedAvatarPath
        : avatarRemoved
          ? undefined
          : oldAvatarPath,
    } as editedUserProps;
  } catch (e) {
    if (e) console.log(e);
    if (isZodError(e)) {
      const errors = e.response?.data.errors;
      const firstError = errors && Object.values(errors)[0]?.[0];
      throw new Error(firstError ?? "Invalid input");
    } else if (axios.isAxiosError(e) && e.response?.status === 409) {
      throw new Error("Username already exist");
    } else if (axios.isAxiosError(e) && e.response?.status === 403) {
      throw new Error("You are not authorized");
    } else {
      throw new Error("Something went wrong");
    }
  }
}
