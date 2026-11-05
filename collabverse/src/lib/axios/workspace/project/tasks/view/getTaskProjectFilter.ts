import { taskFilterProjectProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getTaskProjectFilter({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const res = await api.get<{ projects: taskFilterProjectProps[] }>(
    `/api/workspace/${workspaceId}/projects/task-filter`,
  );
  return res.data.projects;
}
