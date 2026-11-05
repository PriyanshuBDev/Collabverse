import api from "@/lib/axios";

export async function unpinAllMsgs({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/pin-message/unpin-all`,
  );
}
