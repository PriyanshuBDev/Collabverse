import { activityProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getSingleWsActivity({
  workspaceId,
  activityId,
}: {
  workspaceId: string;
  activityId: string;
}) {
  const res = await api.get<{ activity: activityProps }>(
    `/api/workspace/${workspaceId}/overview/activities/${activityId}`,
  );
  return res.data.activity;
}
