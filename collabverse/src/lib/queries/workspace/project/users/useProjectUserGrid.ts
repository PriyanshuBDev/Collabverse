import { projectUserProps, projectUserResPropsGrid } from "@/app/interfaces";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { getGridProjectUsersKey } from "@/lib/functions/project/user/getProjectUsersKey";
import { getProjectUsersGrid } from "@/lib/axios/workspace/project/users/getProjectUsersGrid";
import { projectTaskRemoveUser } from "@/lib/axios/workspace/project/users/removeProjectUser";
import {
  projectTaskRole,
  projectTaskRoleChange,
} from "@/lib/axios/workspace/project/users/roleChangeProjectUser";

export const useProjectUserGrid = (
  projectId: string,
  search?: string,
  taskId?: string,
) => {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const queryClient = useQueryClient();
  const queryKey = getGridProjectUsersKey(
    id,
    projectId,
    taskId,
    shouldSearch ? normalizedSearch : "",
  );
  const usersQuery = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getProjectUsersGrid({
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
      projectTaskRemoveUser({ workspaceId: id, userId, projectId, taskId }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<projectUserResPropsGrid>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<projectUserResPropsGrid>>(
        { queryKey },
        (
          oldData: InfiniteData<projectUserResPropsGrid, unknown> | undefined,
        ) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: projectUserResPropsGrid) => ({
              ...page,
              users: page.users.filter(
                (user: projectUserProps) => user.id !== userId,
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
          InfiniteData<projectUserResPropsGrid, unknown> | undefined,
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
        queryKey: [id, projectId, "users"],
      });
    },
  });
  const roleChangingMutation = useMutation({
    mutationFn: ({ role, userId }: { role: projectTaskRole; userId: string }) =>
      projectTaskRoleChange({
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
      role: projectTaskRole;
      userId: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<projectUserResPropsGrid>
      >({
        queryKey,
      });
      queryClient.setQueriesData<InfiniteData<projectUserResPropsGrid>>(
        { queryKey },
        (
          oldData: InfiniteData<projectUserResPropsGrid, unknown> | undefined,
        ) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: projectUserResPropsGrid) => ({
              ...page,
              users: page.users.map((user: projectUserProps) =>
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
          InfiniteData<projectUserResPropsGrid, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to change user role"));
    },
    onSuccess: () => {
      toast.success("User role changed successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, projectId, "users"],
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
