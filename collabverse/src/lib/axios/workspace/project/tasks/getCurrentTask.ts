import { currentTaskProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getCurrentTask({
  slug,
  projectId,
  workspaceId,
}: {
  slug: string;
  projectId: string;
  workspaceId: string;
}) {
  const res = await api.get<{ task: currentTaskProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/current/${slug}`,
  );
  return res.data.task;
}
