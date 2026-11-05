import { usersTaskFilterProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getProjectUserFilters({
  projectId,
  workspaceId,
}: {
  projectId: string;
  workspaceId: string;
}) {
  const res = await api.get<{ tasks: usersTaskFilterProps[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/users/filter-data`,
  );
  return res.data.tasks;
}
