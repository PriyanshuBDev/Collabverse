import { activityProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getSingleTaskActivity({
  workspaceId,
  projectId,
  taskId,
  activityId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  activityId: string;
}) {
  const res = await api.get<{ activity: activityProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/activities/${activityId}`,
  );
  console.log(res.data);
  return res.data.activity;
}
