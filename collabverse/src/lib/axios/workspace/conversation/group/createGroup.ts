import { createGroupUserProps } from "@/app/interfaces";
import api from "@/lib/axios";
import uploadAvatar from "@/lib/axios/upload/uploadAvatar";

export async function createGroup({
  workspaceId,
  name,
  avatar,
  description,
  users,
}: {
  workspaceId: string;
  name: string;
  avatar?: File;
  description?: string;
  users?: createGroupUserProps[];
}) {
  const res = await api.post<{ id: string }>(
    `/api/workspace/${workspaceId}/conversation/group/create`,
    {
      name,
      description,
      users,
    },
  );
  if (avatar) {
    await uploadAvatar(res.data.id, avatar, "groups");
  }
  return res.data.id;
}
