import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { createGroup } from "@/lib/axios/workspace/conversation/group/createGroup";
import { createGroupUserProps } from "@/app/interfaces";

export const useCreateGroup = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, slug } = useCurrentWorkspace();
  const mutation = useMutation({
    mutationFn: ({
      avatar,
      description,
      name,
      users,
    }: {
      name: string;
      description?: string;
      avatar?: File;
      users?: createGroupUserProps[];
    }) => createGroup({ workspaceId: id, avatar, description, name, users }),

    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to create Group"));
    },
    onSuccess: (groupId) => {
      toast.success("Group created");
      router.push(`/app/${slug}/conversation/${groupId}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "conversations", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: [id, "conversations", "ids"],
      });
    },
  });
  return {
    createGroup: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
  };
};
