import { taskCreateUsersProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function addUsersToTask({
  workspaceId,
  projectId,
  taskId,
  users,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  users: taskCreateUsersProps[];
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users/assign`,
    {
      users,
    },
  );
}
