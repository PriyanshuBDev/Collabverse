import api from "../..";

export async function projectInvitationResponse({
  workspaceId,
  projectId,
  invitationId,
  response,
}: {
  workspaceId: string;
  projectId: string;
  invitationId: string;
  response: "Accept" | "Decline";
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/projects/${projectId}/invitation/${invitationId}/response`,
    {
      response,
    },
  );
}
