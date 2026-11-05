import { getInvitationLink } from "@/lib/axios/workspace/invitation/getInvitationLink";
import { sendInvitationUsername } from "@/lib/axios/workspace/invitation/sendInvitationUsername";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
interface usernameProps {
  username: string;
  role: wsRoleChange;
  expireAt?: Date;
}
export function useInvitationCreate() {
  const { id } = useCurrentWorkspace();

  const linkInvitation = useMutation({
    mutationFn: ({
      role,
      maxUses,
      expireAt,
    }: {
      role: wsRoleChange;
      maxUses: number;
      expireAt?: Date;
    }) =>
      getInvitationLink({
        workspaceId: id,
        role,
        maxUses,
        expireAt,
      }),
    onError: (err: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(err, "Failed to create invitation link"));
    },
    onSuccess: async (url) => {
      await navigator.clipboard.writeText(url);
    },
  });
  const usernameInvitation = useMutation({
    mutationFn: ({ username, role, expireAt }: usernameProps) =>
      sendInvitationUsername({ workspaceId: id, username, role, expireAt }),
    onError: (err: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(err, "Failed to send invitation"));
    },
    onSuccess: (_, variables: usernameProps) => {
      toast.success(`Invitation link sent to ${variables.username}`);
    },
  });
  return {
    linkInvitation,
    usernameInvitation,
  };
}
