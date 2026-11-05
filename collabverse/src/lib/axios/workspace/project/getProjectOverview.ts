import { CompleteProjectProps } from "@/app/interfaces";
import api from "../..";

export async function getProjectOverview(
  workspaceId: string,
  projectId: string,
) {
  const res = await api.get<{ project: CompleteProjectProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}`,
  );
  return res.data.project;
}
