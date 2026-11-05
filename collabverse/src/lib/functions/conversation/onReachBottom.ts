import { queryClient } from "@/components/wrappers/QueryProvider";
import { getInfiniteMessages } from "@/lib/axios/workspace/conversation/messages/getInfiniteMessages";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { Dispatch, SetStateAction } from "react";

export async function onReachBottom(
  setLoading: Dispatch<SetStateAction<boolean>>,
  loading: boolean,
  workspaceId: string,
  conversationId: string,
) {
  if (loading) return;
  setLoading(true);
  try {
    const { bottomCursor, upsertMessages, expandWindowDown, setCursors } =
      useChatStore.getState();
    if (!bottomCursor) return;
    const res = await queryClient.fetchQuery({
      queryKey: [
        workspaceId,
        "conversation",
        conversationId,
        "messages-after",
        bottomCursor,
      ],
      queryFn: () =>
        getInfiniteMessages({
          workspaceId,
          conversationId,
          bottom: bottomCursor,
        }),
    });
    upsertMessages(res.messages);
    setCursors(null, res.nextCursor);
    expandWindowDown();
  } finally {
    setLoading(false);
  }
}
