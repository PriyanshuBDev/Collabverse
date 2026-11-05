import { taskStatusCardProps } from "@/components/overview/TaskStatusCard";
import api from "../..";

export async function getTaskCountByStatus({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ data: taskStatusCardProps[] }>(
    `/api/workspace/${workspaceId}/overview/task-status`,
    {
      params: {
        projectId,
      },
    },
  );
  return res.data.data;
}
