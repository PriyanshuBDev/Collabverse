import { projectInvitedUser } from "@/app/interfaces";
import api from "../..";
import uploadAvatar from "../../upload/uploadAvatar";
interface resProps {
  id: string;
  slug: string;
}
export async function createProject({
  workspaceId,
  name,
  avatar,
  description,
  dueDate,
  users,
}: {
  workspaceId: string;
  name: string;
  avatar?: File;
  description?: string;
  dueDate?: Date;
  users?: projectInvitedUser[];
}) {
  try {
    const members = users?.map((u: projectInvitedUser) => ({
      id: u.id,
      role: u.role,
    }));
    const res = await api.post<resProps>(
      `/api/workspace/${workspaceId}/projects/create`,
      {
        name,
        description,
        dueDate,
        users: members,
      },
    );

    if (avatar) {
      const payload = await uploadAvatar(
        res.data.id,
        avatar,
        "projects",
        workspaceId,
      );
      return { ...res.data, avatar: payload.publicUrl };
    }
    return { ...res.data };
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong");
  }
}
