import { taskBoardProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { Priority, TaskStatus } from "@prisma/client";

export async function getTaskBoard({
  workspaceId,
  projectId,
  status,
  lastPosition,
  priority,
  assignedTo,
  search,
  due,
  signal,
}: {
  workspaceId: string;
  projectId: string;
  status: TaskStatus;
  lastPosition?: number;
  search?: string;
  priority?: Priority;
  due?: Date;
  assignedTo?: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<taskBoardProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks`,
    {
      params: {
        view: "board",
        status,
        lastPosition,
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
