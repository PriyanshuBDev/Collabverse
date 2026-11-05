import api from "@/lib/axios";

export async function toggleReaction({
  workspaceId,
  conversationId,
  messageId,
  reaction,
}: {
  workspaceId: string;
  conversationId: string;
  messageId: string;
  reaction: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/${messageId}/reaction`,
    { reaction },
  );
}
