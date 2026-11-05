import { createGroupUserProps } from "@/app/interfaces";
import { addUserToGroup } from "@/lib/axios/workspace/conversation/group/addUserToGroup";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddUsersToGroup = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (users: createGroupUserProps[]) =>
      addUserToGroup({ workspaceId, conversationId, users }),
    onError: (e) => {
      toast.error(`Failed to add users to group`);
      console.error(e);
    },
    onSuccess: () => {
      toast.error(`Users added to group successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversation", conversationId, "group-data"],
      });
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
    },
  });
};
