import { projectInviteUserProps } from "@/app/interfaces";
import { getWsUserForInvite } from "@/lib/axios/workspace/project/invitation/getWsUserForInvite";
import { sendProjectInvitations } from "@/lib/axios/workspace/project/invitation/sendProjectInvitations";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useUsersToInviteProject(search?: string) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const actualSearch = useSearch(search);
  const users = useInfiniteQuery({
    queryKey: [ws.id, "project", project.id, "invite", "users", actualSearch],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getWsUserForInvite({
        workspaceId: ws.id,
        projectId: project.id,
        cursor: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const inviteUsers = useMutation({
    mutationFn: ({
      users,
      expireAt,
    }: {
      users: projectInviteUserProps[];
      expireAt?: Date;
    }) =>
      sendProjectInvitations({
        workspaceId: ws.id,
        projectId: project.id,
        users,
        expireAt,
      }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to invite user(s) to project"));
    },
    onSuccess: () => {
      toast.success("Successfully invited user(s)");
    },
  });
  return {
    ...users,
    inviteUsers,
  };
}
