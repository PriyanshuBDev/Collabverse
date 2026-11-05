import { GroupData } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getGroupData({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ data: GroupData }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/header`,
  );
  return res.data.data;
}
