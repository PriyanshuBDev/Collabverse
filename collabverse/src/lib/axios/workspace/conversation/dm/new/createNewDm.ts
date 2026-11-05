import api from "@/lib/axios";

export async function createNewDm({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) {
  const res = await api.post<{ conversationId: string }>(
    `/api/workspace/${workspaceId}/conversation/dm/create/${userId}`,
  );
  return res.data;
}
