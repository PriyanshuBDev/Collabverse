import api from "@/lib/axios";

export async function sendConvoHeartbeat({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  return await api.post(`/api/workspace/${workspaceId}/conversation/active`, {
    conversationId,
  });
}
