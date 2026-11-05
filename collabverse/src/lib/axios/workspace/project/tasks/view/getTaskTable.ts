import { taskTableProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { Priority } from "@prisma/client";

export async function getTaskTable({
  workspaceId,
  page,
  projectId,
  priority,
  assignedTo,
  search,
  due,
  signal,
}: {
  workspaceId: string;
  projectId: string;
  page: number;
  search?: string;
  priority?: Priority;
  due?: Date;
  assignedTo?: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<taskTableProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks`,
    {
      params: {
        view: "table",
        page,
        search: search && search.length > 2 ? search : undefined,
        priority,
        due,
        assignedTo,
      },
      signal,
    },
  );
  return res.data;
}
