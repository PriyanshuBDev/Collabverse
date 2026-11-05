import { activityResponse } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getTaskActivities({
  workspaceId,
  projectId,
  taskId,
  cursorCreatedAt,
  cursorId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  cursorId?: string;
  cursorCreatedAt?: Date;
}) {
  const res = await api.get<activityResponse>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/activities`,
    {
      params: {
        cursorId,
        cursorCreatedAt,
      },
    },
  );
  return res.data;
}
