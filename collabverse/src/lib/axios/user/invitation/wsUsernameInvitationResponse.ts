import api from "../..";

export async function wsUsernameInvitationResponse({
  status,
  workspaceId,
  invitationId,
}: {
  status: "Accept" | "Decline";
  workspaceId: string;
  invitationId: string;
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/invitation/username/${invitationId}`,
    {
      status,
    },
  );
}
