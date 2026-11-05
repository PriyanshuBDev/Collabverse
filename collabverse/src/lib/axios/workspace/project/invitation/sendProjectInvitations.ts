import { projectInviteUserProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function sendProjectInvitations({
  workspaceId,
  projectId,
  users,
  expireAt,
}: {
  workspaceId: string;
  projectId: string;
  users: projectInviteUserProps[];
  expireAt?: Date;
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/projects/${projectId}/invitation`,
    {
      users,
      expireAt,
    },
  );
}
