import { WorkspacesProps, wsProps } from "@/app/interfaces";
import getWorkspaces from "@/lib/axios/workspace/getWorkspaces";
import { useQuery } from "@tanstack/react-query";

export const useWorkspaceSidebar = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces(),
    select: (data): wsProps[] =>
      data.map((ws: WorkspacesProps) => ({
        id: ws.id,
        name: ws.name,
        avatar: ws.avatar,
        slug: ws.slug,
      })),
  });
};
