import { getMessagesResProps } from "@/app/interfaces";
import api from "@/lib/axios";
export type getMessageMode = "latest" | "before" | "after" | "around";
export async function getMessages({
  workspaceId,
  conversationId,
  mode,
  cursor,
}: {
  workspaceId: string;
  conversationId: string;
  mode: getMessageMode;
  cursor?: string;
}) {
  const res = await api.get<getMessagesResProps>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages`,
    {
      params: {
        mode,
        cursor,
      },
    },
  );
  return res.data;
}
