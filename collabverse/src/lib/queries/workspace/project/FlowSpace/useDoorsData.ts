import { getOpenDoors } from "@/lib/axios/workspace/project/FlowSpace/getOpenDoors";
import { toggleDoors } from "@/lib/axios/workspace/project/FlowSpace/toggleDoors";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { Doors } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDoorsData = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const doorState = useQuery({
    queryKey: [workspaceId, projectId, "flowspace", "doors"],
    queryFn: () => getOpenDoors({ workspaceId, projectId }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const toggleDoorState = useMutation({
    mutationFn: ({ doorId, enabled }: { doorId: Doors; enabled: boolean }) =>
      toggleDoors({ workspaceId, projectId, doorId, enabled }),
    onError: (_e, v) => {
      toast.error(`Failed to ${v.enabled ? "open" : "close"} door`);
    },
  });
  return { doorState, toggleDoorState };
};
