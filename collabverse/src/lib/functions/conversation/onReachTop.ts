import { queryClient } from "@/components/wrappers/QueryProvider";
import { getInfiniteMessages } from "@/lib/axios/workspace/conversation/messages/getInfiniteMessages";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { Dispatch, SetStateAction } from "react";

export async function onReachTop(
  setLoading: Dispatch<SetStateAction<boolean>>,
  loading: boolean,
  workspaceId: string,
  conversationId: string,
) {
  if (loading) return;
  setLoading(true);
  try {
    const { topCursor, upsertMessages, expandWindowUp, setCursors } =
      useChatStore.getState();
    if (!topCursor) return;
    const res = await queryClient.fetchQuery({
      queryKey: [
        workspaceId,
        "conversation",
        conversationId,
        "messages-before",
        topCursor,
      ],
      queryFn: () =>
        getInfiniteMessages({ workspaceId, conversationId, top: topCursor }),
    });
    upsertMessages(res.messages);
    setCursors(res.nextCursor, null);
    expandWindowUp();
  } finally {
    setLoading(false);
  }
}
