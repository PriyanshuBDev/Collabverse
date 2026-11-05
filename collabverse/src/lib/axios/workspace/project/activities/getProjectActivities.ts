import { activityResponse } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getProjectActivities({
  workspaceId,
  projectId,
  cursorCreatedAt,
  cursorId,
}: {
  workspaceId: string;
  projectId: string;
  cursorId?: string;
  cursorCreatedAt?: Date;
}) {
  const res = await api.get<activityResponse>(
    `/api/workspace/${workspaceId}/projects/${projectId}/activities`,
    {
      params: {
        cursorId,
        cursorCreatedAt,
      },
    },
  );
  return res.data;
}
