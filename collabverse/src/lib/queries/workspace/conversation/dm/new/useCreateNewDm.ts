import { createNewDm } from "@/lib/axios/workspace/conversation/dm/new/createNewDm";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateNewDm(route: boolean) {
  const { id: workspaceId, slug } = useCurrentWorkspace();
  const router = useRouter();
  return useMutation({
    mutationFn: (userId: string) => createNewDm({ workspaceId, userId }),
    onError: () => {
      toast.error("Failed to create new conversation");
    },
    onSuccess: (data) => {
      if (route) {
        router.replace(`/app/${slug}/conversation/${data.conversationId}`);
      }
    },
  });
}
