import { wsInvitationProps } from "@/app/interfaces";
import api from "../..";

export async function getWsLinkInvitationDetails({
  workspaceSlug,
  token,
}: {
  workspaceSlug: string;
  token: string;
}) {
  const res = await api.get<{ invitation: wsInvitationProps }>(
    `/api/workspace/slug/${workspaceSlug}/invitation/${token}`,
  );
  return res.data.invitation;
}
