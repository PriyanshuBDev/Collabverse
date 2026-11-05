import { upcomingTasksResProps } from "@/app/interfaces";
import api from "@/lib/axios";

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
