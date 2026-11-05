import api from "@/lib/axios";

export async function clearAllMsgs({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/clear`,
  );
}
