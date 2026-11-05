import { projectProps } from "@/app/interfaces";
import api from "../..";

export async function getProjectSearchbar({
  workspaceId,
  search,
  signal,
}: {
  workspaceId: string;
  search: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<{ projects: projectProps[] }>(
    `/api/workspace/${workspaceId}/projects/search`,
    {
      params: {
        search,
      },
      signal,
    },
  );
  return res.data.projects;
}
