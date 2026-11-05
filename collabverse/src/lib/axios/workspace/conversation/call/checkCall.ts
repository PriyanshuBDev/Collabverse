import api from "@/lib/axios";

export async function checkCall({
  workspaceId,
  callId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
  callId: string;
}) {
  const res = await api.get<{ success: boolean }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/call/${callId}/check`,
  );
  return res.data.success;
}
