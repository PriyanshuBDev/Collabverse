import { leaveGroup } from "@/lib/axios/workspace/conversation/group/leaveGroup";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type props = {
  name: string;
};
export function useLeaveGroup(conversationId: string) {
  const { id: workspaceId, slug } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({}: props) => leaveGroup({ workspaceId, conversationId }),
    onError: (error: AxiosError<ApiError>, v) => {
      toast.error(
        getApiErrorMessage(error, `Failed to leave group: ${v.name}`),
      );
    },
    onSuccess: (_d, v) => {
      toast.success(`Successfully left the group: ${v.name}`);
      router.push(`/app/${slug}/conversation`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
    },
  });
}
