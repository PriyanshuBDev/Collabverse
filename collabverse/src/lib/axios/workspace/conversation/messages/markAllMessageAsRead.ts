import api from "@/lib/axios";

export async function markAllMessagesAsRead({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/mark-all`,
  );
}
