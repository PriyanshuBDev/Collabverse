import { ProjectMembersProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function searchProjectUsers({
  workspaceId,
  projectId,
  search,
  mode,
  signal,
}: {
  workspaceId: string;
  projectId: string;
  search: string;
  mode?: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<{ users: ProjectMembersProps[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/users/search`,
    {
      params: {
        search: search.length > 1 ? search : undefined,
        mode,
      },
      signal,
    },
  );
  return res.data.users;
}
