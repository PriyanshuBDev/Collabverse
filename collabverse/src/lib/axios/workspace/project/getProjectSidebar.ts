import { projectProps } from "@/app/interfaces";
import api from "../..";
export interface getProjectSidebarProps {
  projects: projectProps[];
  hasMore: boolean;
}
export async function getProjectSidebar({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const res = await api.get<getProjectSidebarProps>(
    `/api/workspace/${workspaceId}/projects/sidebar`,
  );
  return res.data;
}
