import api from "../..";
export interface wsInvitationDataProps {
  avatar: string | null;
  members: number;
}
export async function getInvitationData(workspaceId: string) {
  const res = await api.get<wsInvitationDataProps>(
    `/api/workspace/${workspaceId}/invitation`,
  );
  return res.data;
}
