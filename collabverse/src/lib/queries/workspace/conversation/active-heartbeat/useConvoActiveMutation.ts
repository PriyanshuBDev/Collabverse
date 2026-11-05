import { sendConvoHeartbeat } from "@/lib/axios/workspace/conversation/active-heartbeat/sendConvoHeartbeat";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation } from "@tanstack/react-query";

export const useConvoActiveMutation = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  return useMutation({
    mutationFn: (conversationId: string) =>
      sendConvoHeartbeat({ workspaceId, conversationId }),
    onError: (e) => {
      console.error(`Failed to persist current conversation`, e);
    },
  });
};
