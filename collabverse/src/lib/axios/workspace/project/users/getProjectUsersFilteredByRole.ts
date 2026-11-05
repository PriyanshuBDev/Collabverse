import { projectFilteredUsersResProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { PRole } from "@prisma/client";

export async function getProjectUsersFilteredByRole({
  workspaceId,
  projectId,
  role,
  cursor,
  search,
}: {
  workspaceId: string;
  projectId: string;
  role?: PRole;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<projectFilteredUsersResProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/users/search/filter-role`,
    {
      params: {
        role,
        cursor,
        search: search && search.length > 1 ? search : undefined,
      },
    },
  );
  return res.data;
}
