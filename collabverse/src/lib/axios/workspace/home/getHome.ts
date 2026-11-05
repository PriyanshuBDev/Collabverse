import { homeProps } from "@/app/interfaces";
import api from "../..";

export async function getHome({ workspaceId }: { workspaceId: string }) {
  const res = await api.get<{ data: homeProps }>(
    `/api/workspace/${workspaceId}/home`,
  );
  return res.data.data;
}
