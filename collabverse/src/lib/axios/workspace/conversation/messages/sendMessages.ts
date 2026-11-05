import { CompleteChatProps, msgDataForApi } from "@/app/interfaces";
import api from "@/lib/axios";
export async function sendMessages({
  workspaceId,
  conversationId,
  msg,
}: {
  workspaceId: string;
  conversationId: string;
  msg: msgDataForApi;
}) {
  const res = await api.post<{ msg: CompleteChatProps }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/create`,
    {
      msg,
    },
  );
  return res.data.msg;
}
