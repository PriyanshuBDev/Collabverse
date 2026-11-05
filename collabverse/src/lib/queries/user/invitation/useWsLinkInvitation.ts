import { getWsLinkInvitationDetails } from "@/lib/axios/user/invitation/getWsLinkInvitationDetails";
import { wsLinkInvitationResponse } from "@/lib/axios/user/invitation/wsLinkInvitationResponse";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useWsLinkInvitation(slug: string, token: string) {
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const details = useQuery({
    queryKey: [slug, "invitation", token, "details"],
    queryFn: () => getWsLinkInvitationDetails({ workspaceSlug: slug, token }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug && !!token,
  });
  const linkInvite = useMutation({
    mutationFn: (workspaceId: string) =>
      wsLinkInvitationResponse({ workspaceId, token }),
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
        queryKey: [slug, "invitation", token, "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user.banned_until, "invitations"],
      });
    },
  });
  return {
    ...details,
    linkInvite,
  };
}
