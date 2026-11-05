import api from "@/lib/axios";

export async function togglePinningConversation({
  workspaceId,
  conversationId,
  enabled,
}: {
  workspaceId: string;
  conversationId: string;
  enabled: boolean;
}) {
  return api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/pin`,
    {
      enabled,
    },
  );
}
