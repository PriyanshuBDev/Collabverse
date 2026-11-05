import { wsSummaryProps } from "@/app/interfaces";
import api from "../..";

export async function getWorkspaceSummary(id: string) {
  const res = await api.get<{ data: wsSummaryProps[] }>(
    `/api/workspace/${id}/overview/summary`,
  );
  return res.data.data;
}
