import { DmUserData } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getDmUserData({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ data: DmUserData }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/dm/header`,
  );
  return res.data.data;
}
