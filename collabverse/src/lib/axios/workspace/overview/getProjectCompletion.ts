import { CBDataProps } from "@/components/progress/CompletionBar";
import api from "../..";

export async function getProjectCompletion(workspaceId: string) {
  const res = await api.get<{ data: CBDataProps[] }>(
    `/api/workspace/${workspaceId}/overview/project-completion`,
  );
  return res.data.data;
}
