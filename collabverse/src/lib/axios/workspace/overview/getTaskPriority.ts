import { priortiyDataProps } from "@/components/charts/PriorityChart";
import api from "../..";

export async function getTaskPriority({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ data: priortiyDataProps[] }>(
    `/api/workspace/${workspaceId}/overview/priority`,
    {
      params: {
        projectId,
      },
    },
  );
  return res.data.data;
}
