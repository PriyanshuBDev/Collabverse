import { taskCalendarProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { Priority, TaskStatus } from "@prisma/client";

export async function getTaskCalendar({
  workspaceId,
  projectId,
  date,
  status,
  priority,
  assignedTo,
  search,
  signal,
}: {
  workspaceId: string;
  projectId: string;
  date: Date;
  status?: TaskStatus;
  search?: string;
  priority?: Priority;
  assignedTo?: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<taskCalendarProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks`,
    {
      params: {
        view: "calendar",
        date,
        status,
        search: search && search.length > 2 ? search : undefined,
        priority,
        assignedTo,
      },
      signal,
    },
  );
  return res.data;
}
