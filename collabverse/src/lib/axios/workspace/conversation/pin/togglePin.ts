import api from "@/lib/axios";

export async function togglePin({
  workspaceId,
  conversationId,
  msgId,
  enabled,
}: {
  workspaceId: string;
  conversationId: string;
  enabled: boolean;
  msgId: string;
}) {
  return api.patch<{ pinLength: number }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/pin-message/toggle`,
    {
      enabled,
      messageId: msgId,
    },
  );
}
