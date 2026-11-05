import { getProjectInvitationDetails } from "@/lib/axios/user/invitation/getProjectInvitationDetails";
import { projectInvitationResponse } from "@/lib/axios/user/invitation/projectInvitationResponse";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useProjectInvitationDetails(
  id: string,
  projectId: string,
  invitationId: string,
  shouldFetch: boolean,
) {
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const details = useQuery({
    queryKey: [
      "workspace",
      id,
      "projects",
      projectId,
      "invitation",
      invitationId,
      "details",
    ],
    queryFn: () =>
      getProjectInvitationDetails({ workspaceId: id, projectId, invitationId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id && !!projectId && !!invitationId && shouldFetch,
  });
  const inviteResponse = useMutation({
    mutationFn: (response: "Accept" | "Decline") =>
      projectInvitationResponse({
        response,
        workspaceId: id,
        invitationId,
        projectId,
      }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(
        getApiErrorMessage(
          e,
          "Failed to accept project invitation. Try again later",
        ),
      );
    },
    onSuccess: () => {
      toast.success("Project Invitation accepted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspace",
          id,
          "projects",
          projectId,
          "invitation",
          invitationId,
          "details",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user.id, "invitations"],
      });
      queryClient.invalidateQueries({
        queryKey: [id, "projects", "sidebar"],
      });
    },
  });
  return {
    ...details,
    inviteResponse,
  };
}
