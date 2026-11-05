import { ProjectCardProps } from "@/app/interfaces";
import api from "../..";

export interface getProjectsResProps {
  projects: ProjectCardProps[];
  nextCursor?: string;
}
export async function getProjects({
  workspaceId,
  search,
  cursorId,
}: {
  workspaceId: string;
  search?: string;
  cursorId?: string;
}) {
  const res = await api.get<getProjectsResProps>(
    `/api/workspace/${workspaceId}/projects`,
    {
      params: {
        search,
        cursorId,
      },
    },
  );
  return res.data;
}
