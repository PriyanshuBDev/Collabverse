import api from "@/lib/axios";

export async function joinCall({
  workspaceId,
  conversationId,
  callId,
}: {
  workspaceId: string;
  conversationId: string;
  callId: string;
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/call/${callId}/join`,
  );
}
