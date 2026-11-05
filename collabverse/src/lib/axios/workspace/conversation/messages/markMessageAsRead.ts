import api from "@/lib/axios";

export async function markMessageAsRead({
  workspaceId,
  conversationId,
  messageId,
}: {
  workspaceId: string;
  conversationId: string;
  messageId: string;
}) {
  await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/${messageId}/mark-read`,
  );
}
