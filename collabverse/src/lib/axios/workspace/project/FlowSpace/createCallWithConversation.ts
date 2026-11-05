import { CompleteChatProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { CallType } from "@prisma/client";

export async function createCallWithConversation({
  workspaceId,
  remoteUserId,
  type,
}: {
  workspaceId: string;
  remoteUserId: string;
  type: CallType;
}) {
  const res = await api.post<{
    callId: string;
    msg: CompleteChatProps;
    conversationId: string;
  }>(`/api/workspace/${workspaceId}/conversation/create-call`, {
    type,
    remoteUserId,
  });
  return res.data;
}
