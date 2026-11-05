import api from "../..";

export async function wsLinkInvitationResponse({
  workspaceId,
  token,
}: {
  workspaceId: string;
  token: string;
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/invitation/link/${token}/accept`,
  );
}
