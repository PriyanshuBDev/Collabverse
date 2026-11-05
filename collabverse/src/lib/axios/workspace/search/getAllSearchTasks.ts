import { searchTaskProps } from "@/app/interfaces";
import api from "../..";

export async function getAllSearchTasks({
  search,
  workspaceId,
  page,
}: {
  workspaceId: string;
  page: number;
  search: string;
}) {
  const res = await api.get<{
    tasks: searchTaskProps[];
    total: number;
    limit: number;
    page: number;
  }>(`/api/workspace/${workspaceId}/all-tasks`, {
    params: {
      search,
      page,
    },
  });
  return res.data;
}
