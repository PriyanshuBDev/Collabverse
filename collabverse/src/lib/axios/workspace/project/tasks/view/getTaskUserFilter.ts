import { basicMember } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getTaskUserFilter({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ users: basicMember[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/user-filter`,
  );
  return res.data.users;
}
