import { CompleteChatProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { CallType } from "@prisma/client";

export async function createCallSession({
  workspaceId,
  conversationId,
  type,
}: {
  workspaceId: string;
  conversationId: string;
  type: CallType;
}) {
  const res = await api.post<{ callId: string; msg: CompleteChatProps }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/call/create`,
    {
      type,
    },
  );
  return res.data;
}
