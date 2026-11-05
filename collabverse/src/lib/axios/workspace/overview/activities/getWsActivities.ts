import { activityResponse } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getWsActivities({
  workspaceId,
  cursorCreatedAt,
  cursorId,
}: {
  workspaceId: string;
  cursorId?: string;
  cursorCreatedAt?: Date;
}) {
  const res = await api.get<activityResponse>(
    `/api/workspace/${workspaceId}/overview/activities`,
    {
      params: {
        cursorId,
        cursorCreatedAt,
      },
    },
  );
  return res.data;
}
