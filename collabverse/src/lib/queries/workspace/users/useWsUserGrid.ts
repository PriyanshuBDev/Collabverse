import { wsUserProps, wsUserResPropsGrid } from "@/app/interfaces";
import {
  changeUserRoleCombined,
  combinedRoleChange,
} from "@/lib/axios/workspace/users/changeUserRole";
import { getUsersGrid } from "@/lib/axios/workspace/users/getUserGrid";
import { removeUserCombined } from "@/lib/axios/workspace/users/removeUser";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentWorkspace } from "../../../hooks/useCurrentWorkspace";
import { getGridUsersKey } from "@/lib/functions/workspace/user/getUsersKey";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";

export const useWsUserGrid = (
  search?: string,
  projectId?: string,
  taskId?: string,
) => {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const queryClient = useQueryClient();
  const queryKey = getGridUsersKey(
    id,
    projectId,
    taskId,
    shouldSearch ? normalizedSearch : "",
  );
  const usersQuery = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getUsersGrid({
        workspaceId: id,
        projectId,
        taskId,
        search: shouldSearch ? normalizedSearch : "",
        cursorId: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const removingMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeUserCombined({ workspaceId: id, userId, projectId, taskId }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<wsUserResPropsGrid>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<wsUserResPropsGrid>>(
        { queryKey },
        (oldData: InfiniteData<wsUserResPropsGrid, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: wsUserResPropsGrid) => ({
              ...page,
              users: page.users.filter(
                (user: wsUserProps) => user.id !== userId,
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
          InfiniteData<wsUserResPropsGrid, unknown> | undefined,
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
        queryKey: [id, "users"],
      });
    },
  });
  const roleChangingMutation = useMutation({
    mutationFn: ({
      role,
      userId,
    }: {
      role: combinedRoleChange;
      userId: string;
    }) =>
      changeUserRoleCombined({
        role,
        userId,
        workspaceId: id,
        projectId,
        taskId,
      }),
    onMutate: async ({
      role,
      userId,
    }: {
      role: combinedRoleChange;
      userId: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<wsUserResPropsGrid>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<wsUserResPropsGrid>>(
        { queryKey },
        (oldData: InfiniteData<wsUserResPropsGrid, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: wsUserResPropsGrid) => ({
              ...page,
              users: page.users.map((user: wsUserProps) =>
                user.id === userId ? { ...user, role: role } : user,
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
          InfiniteData<wsUserResPropsGrid, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to change role"));
    },
    onSuccess: () => {
      toast.success("User role changed successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "users"],
      });
    },
  });
  return {
    ...usersQuery,
    removeUser: removingMutation.mutate,
    removeError: removingMutation.isError,
    removing: removingMutation.isPending,
    changeRole: roleChangingMutation.mutate,
    changeRoleError: roleChangingMutation.isError,
    changingRole: roleChangingMutation.isPending,
  };
};
