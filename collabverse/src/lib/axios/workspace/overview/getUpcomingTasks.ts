import api from "@/lib/axios";
import { upcomingTasksResProps } from "@/app/api/workspace/[id]/overview/upcoming-tasks/route";

export async function getUpcomingTasks(
  id: string,
  cursorDueDate?: Date,
  cursorId?: string,
) {
  const res = await api.get<upcomingTasksResProps>(
    `/api/workspace/${id}/overview/upcoming-tasks`,
    {
      params: {
        cursorDueDate,
        cursorId,
      },
    },
  );
  return res.data;
}
