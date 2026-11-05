import { getWsInvitationDetails } from "@/lib/axios/user/invitation/getWsInvitationDetails";
import { wsUsernameInvitationResponse } from "@/lib/axios/user/invitation/wsUsernameInvitationResponse";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useWsInvitationDetails(
  id: string,
  invitationId: string,
  shouldFetch: boolean,
) {
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const details = useQuery({
    queryKey: [id, "invitation", invitationId, "details"],
    queryFn: () => getWsInvitationDetails({ workspaceId: id, invitationId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id && !!invitationId && shouldFetch,
  });
  const usernameInvite = useMutation({
    mutationFn: (status: "Accept" | "Decline") =>
      wsUsernameInvitationResponse({ status, workspaceId: id, invitationId }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(
        getApiErrorMessage(
          e,
          "Failed to accept workspace invitation. Try again later",
        ),
      );
    },
    onSuccess: () => {
      toast.success("Workspace invitation accepted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "invitation", invitationId, "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user.id, "invitations"],
      });
    },
  });
  return {
    ...details,
    usernameInvite,
  };
}
