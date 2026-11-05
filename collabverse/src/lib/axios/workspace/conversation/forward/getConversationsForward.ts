import api from "@/lib/axios";
export type convoForwardProps = {
  convoId: string;
  name: string;
  username?: string;
  avatar?: string;
};
export type convoForwardResProps = {
  conversations: convoForwardProps;
  nextCursor: string | null;
  hasMore: boolean;
};
export async function getConversationsForward({
  workspaceId,
  conversationId,
  cursor,
  search,
}: {
  workspaceId: string;
  conversationId: string;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<convoForwardResProps>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/forward/list`,
    {
      params: {
        cursor,
        search,
      },
    },
  );
  return res.data;
}
