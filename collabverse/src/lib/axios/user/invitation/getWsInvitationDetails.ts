import { wsInvitationProps } from "@/app/interfaces";
import api from "../..";

export async function getWsInvitationDetails({
  workspaceId,
  invitationId,
}: {
  workspaceId: string;
  invitationId: string;
}) {
  const res = await api.get<{ invitation: wsInvitationProps }>(
    `/api/workspace/${workspaceId}/invitation/${invitationId}/details`,
  );
  return res.data.invitation;
}
