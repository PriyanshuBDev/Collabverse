import { getGroupUsersResProps, groupUsersProps } from "@/app/interfaces";
import { changeGroupUserRole } from "@/lib/axios/workspace/conversation/group/changeGroupUserRole";
import { getGroupUsers } from "@/lib/axios/workspace/conversation/group/getGroupUsers";
import { removeGroupUser } from "@/lib/axios/workspace/conversation/group/removeGroupUser";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { GroupRole } from "@prisma/client";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useGroupUsers(search: string) {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const queryClient = useQueryClient();
  const actualSearch = useSearch(search);
  const queryKey = [
    workspaceId,
    "conversation",
    conversationId,
    "group-users",
    actualSearch,
  ];
  const users = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getGroupUsers({
        workspaceId,
        conversationId,
        cursorId: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const removingMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeGroupUser({ workspaceId, conversationId, userId }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<getGroupUsersResProps>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<getGroupUsersResProps>>(
        { queryKey },
        (oldData: InfiniteData<getGroupUsersResProps, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: getGroupUsersResProps) => ({
              ...page,
              users: page.users.filter(
                (user: groupUsersProps) => user.id !== userId,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(
        ([key, data]: [
          readonly unknown[],
          InfiniteData<getGroupUsersResProps, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to remove user"));
    },
    onSuccess: () => {
      toast.success("User removed successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversation", conversationId, "details"],
      });
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "group", undefined, "users"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          workspaceId,
          "conversations",
          "group",
          conversationId,
          "users",
        ],
      });
    },
  });
  const roleChangingMutation = useMutation({
    mutationFn: ({ role, userId }: { role: GroupRole; userId: string }) =>
      changeGroupUserRole({
        role,
        userId,
        workspaceId,
        conversationId,
      }),
    onMutate: async ({ role, userId }: { role: GroupRole; userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<getGroupUsersResProps>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<getGroupUsersResProps>>(
        { queryKey },
        (oldData: InfiniteData<getGroupUsersResProps, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: getGroupUsersResProps) => ({
              ...page,
              users: page.users.map((user: groupUsersProps) =>
                user.id === userId ? { ...user, role: role } : user,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(getApiErrorMessage(_err, "Failed to change role"));
    },
    onSuccess: () => {
      toast.success("User role changed successfully");
    },
  });
  return { ...users, removingMutation, roleChangingMutation };
}
