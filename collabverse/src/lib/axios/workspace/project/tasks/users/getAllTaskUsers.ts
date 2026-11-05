import { memberProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getAllTaskUsers({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const res = await api.get<{ members: memberProps[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users/all`,
  );
  return res.data;
}
