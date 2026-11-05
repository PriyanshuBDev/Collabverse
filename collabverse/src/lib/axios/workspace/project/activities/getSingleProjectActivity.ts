import { activityProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getSingleProjectActivity({
  workspaceId,
  projectId,
  activityId,
}: {
  workspaceId: string;
  projectId: string;
  activityId: string;
}) {
  const res = await api.get<{ activity: activityProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/activities/${activityId}`,
  );
  return res.data.activity;
}
