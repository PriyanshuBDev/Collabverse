import { PCDataProps } from "@/components/charts/ProductivityChart";
import api from "../..";

export async function getProductivityData({
  workspaceId,
  timePeriod,
}: {
  workspaceId: string;
  timePeriod: "Week" | "Month";
}) {
  const res = await api.get<{ data: PCDataProps[] }>(
    `/api/workspace/${workspaceId}/overview/productivity`,
    {
      params: {
        timePeriod,
      },
    },
  );
  return res.data.data;
}
