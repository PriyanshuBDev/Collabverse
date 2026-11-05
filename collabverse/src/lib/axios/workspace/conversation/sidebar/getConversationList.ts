import { chatListProps } from "@/app/interfaces";
import api from "../../..";
export interface convoListResProps {
  conversations: chatListProps[];
  hasMore: boolean;
  nextCursor: string | null;
}
export async function getConversationList({
  workspaceId,
  cursor,
  search,
}: {
  workspaceId: string;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<convoListResProps>(
    `/api/workspace/${workspaceId}/conversation/sidebar/list`,
    {
      params: {
        cursor,
        search,
      },
    },
  );
  return res.data;
}
