import { chatListProps } from "../../../app/interfaces";
import { useSidebarStore } from "@/lib/hooks/zustand/useSidebarStore";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { markAllMsgsRead } from "@/lib/hooks/conversation/useChatMessages";
import { upsertSidebar } from "@/lib/hooks/realtime/Conversation/useConvoSidebarRT";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useParams } from "next/navigation";
import { useSidebarMutations } from "@/lib/queries/workspace/conversation/sidebar/useSidebarMutations";
import { createPortal } from "react-dom";
import Spinner1 from "@/components/loadings/Spinner1";
import useMounted from "@/lib/hooks/useMounted";
import { MuteEnum } from "@prisma/client";
import ConvoSidebarCard from "./ConvoSidebarCard";
import { useConversationList } from "@/lib/queries/workspace/conversation/sidebar/useConversationList";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useMemo } from "react";
import { sortConvoList } from "@/lib/functions/chat/sortConvoList";
import { convoListResProps } from "@/lib/axios/workspace/conversation/sidebar/getConversationList";

export default function ChatList({
  open,
  search,
}: {
  open: boolean;
  search: string;
}) {
  const { conversationId: currentConversationId } = useParams<{
    conversationId?: string;
  }>();
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    isPending,
    hasNextPage,
    isError,
    error,
  } = useConversationList(search);
  useIsErrorToast(isError, "Failed to fetch conversation list", error);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    rootMargin: "200px 0px 200px 0px",
  });
  const { id: workspaceId, slug: workspaceSlug } = useCurrentWorkspace();
  const { id: currentUserId } = useCurrentUser();
  const mounted = useMounted();
  const { togglePin, muteMutation, clearChat, removeMutation } =
    useSidebarMutations(currentConversationId);
  const byId = useSidebarStore((s) => s.byId);
  const sidebarIds = useSidebarStore((s) => s.sidebarIds);
  const conversations = useMemo(() => {
    return sidebarIds
      .map((id: string) => byId[id])
      .filter(Boolean)
      .sort(sortConvoList);
  }, [sidebarIds, byId]);
  const searchedConversations = useMemo(() => {
    const searchedIds =
      data?.pages.flatMap((p: convoListResProps) =>
        p.conversations.map((c: chatListProps) => c.id),
      ) ?? [];
    return searchedIds
      .map((id: string) => byId[id])
      .filter(Boolean)
      .sort(sortConvoList);
  }, [byId, data]);
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full w-full ">
        <Spinner1 size="size-6 lg:size-8"></Spinner1>
      </div>
    );
  }
  const handleMarkAllAsRead = (convoId: string) => {
    markAllMsgsRead(convoId, workspaceId, currentUserId);
    upsertSidebar(convoId, workspaceId, currentUserId, true, {
      unread: 0,
      lastActivityAt: new Date(),
      lastMessage: undefined,
    });
  };
  const result =
    search.length > 1 ? (searchedConversations ?? []) : conversations;
  return (
    <>
      <div
        className={`overflow-y-auto h-full flex flex-col gap-1 w-full px-1  pb-20 scrollbar-none text-nowrap transition-all duration-200`}
      >
        {result.length === 0 && (
          <div className=" flex items-center justify-center w-full h-full text-gray-600 dark:text-gray-400 text-sm lg:text-xl">
            {open
              ? search.length > 1
                ? "No results found"
                : "No conversations "
              : ""}
          </div>
        )}
        {result.map((c: chatListProps) => (
          <ConvoSidebarCard
            key={c.id}
            c={c}
            handleMarkAllAsRead={() => handleMarkAllAsRead(c.id)}
            workspaceSlug={workspaceSlug}
            currentUserId={currentUserId}
            handleTogglePin={() =>
              togglePin.mutate({
                conversationId: c.id,
                enabled: c.pinIdx ? false : true,
                currentPinIdx: c.pinIdx,
              })
            }
            handleClearChat={() => clearChat.mutate(c)}
            handleDeleteChat={() => removeMutation.mutate(c)}
            handleMuting={(enabled: boolean, muteType?: MuteEnum) =>
              muteMutation.mutate({ enabled, muteType, conversation: c })
            }
            isPending={clearChat.isPending || removeMutation.isPending}
          />
        ))}
        {isFetchingNextPage && (
          <div className=" flex items-center justify-center w-full">
            <div className="bg-white/20 backdrop-blur-xl rounded-full lg:p-2 p-1">
              <Spinner1 size="size-4 lg:size-6" />
            </div>
          </div>
        )}
        <div ref={loadMoreRef} />
      </div>
      ,
      {(clearChat.isPending || removeMutation.isPending) &&
        mounted &&
        createPortal(
          <div className="flex items-center justify-center h-full w-full ">
            <Spinner1 size="size-10 lg:size-12"></Spinner1>
          </div>,
          document.body,
        )}
    </>
  );
}
