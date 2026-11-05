import { projectInvitationProps } from "@/app/interfaces";
import api from "../..";

export async function getProjectInvitationDetails({
  workspaceId,
  projectId,
  invitationId,
}: {
  workspaceId: string;
  projectId: string;
  invitationId: string;
}) {
  const res = await api.get<{ invitation: projectInvitationProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/invitation/${invitationId}/details`,
  );
  return res.data.invitation;
}
