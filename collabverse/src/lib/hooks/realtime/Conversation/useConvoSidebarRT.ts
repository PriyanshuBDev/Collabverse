import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useMemo } from "react";
import useCurrentUser from "../../useCurrentUser";
import { useCurrentWorkspace } from "../../useCurrentWorkspace";
import { ChatListType, ConvMemberStatus, MuteEnum } from "@prisma/client";
import { chatListProps } from "@/app/interfaces";
import { useSidebarStore } from "../../zustand/useSidebarStore";
import { getSingleConversation } from "@/lib/axios/workspace/conversation/sidebar/getSingleConversation";
import { useChatStore } from "../../zustand/useChatStore";
export type convoDB = {
  id: string;
  type: ChatListType;
  name?: string;
  descritpion?: string;
  avatar?: string;
  workspaceId: string;
  lastMessageId?: string;
  lastActivityAt: Date;
};
export type convoMember = {
  workspaceId: string;
  conversationId: string;
  role?: string;
  mutedFor?: MuteEnum;
  mutedAt?: Date;
  lastMessageId?: string;
  status?: ConvMemberStatus;
  leftAt?: Date;
  clearedAt?: Date;
  deletedAt?: Date;
};
export function useConvoSidebarRT() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: currentUserId } = useCurrentUser();
  const { id: workspaceId } = useCurrentWorkspace();

  useEffect(() => {
    if (!workspaceId || !currentUserId) return;
    const channel = supabase
      .channel(`conversation-sidebar-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Conversation",
          filter: `workspaceId=eq.${workspaceId}`,
        },
        async (payload) => {
          const oldData = payload.old as convoDB;
          const newData = payload.new as convoDB;
          switch (payload.eventType) {
            case "UPDATE": {
              const update: Partial<chatListProps> = { ...newData };

              if (
                newData.lastMessageId &&
                oldData.lastMessageId !== newData.lastMessageId
              ) {
                const conversations = useChatStore.getState().conversations;
                const messagesMap = conversations[newData.id].messagesMap;
                const lastMessage = messagesMap[newData.lastMessageId];

                if (lastMessage?.user.id !== currentUserId) {
                  upsertSidebar(newData.id, workspaceId, currentUserId, false, {
                    lastActivityAt: update.lastActivityAt,
                    lastMessage: {
                      ...lastMessage,
                      callStatus: lastMessage?.call?.status,
                      messagedBy: {
                        name: lastMessage?.user?.name ?? "unknown",
                        id: lastMessage?.user?.id ?? "",
                      },
                      isDeletedForUser: lastMessage?.isDeletedForUser,
                    },
                  });
                  break;
                }
              }

              if (newData.type === "Group") {
                upsertSidebar(
                  newData.id,
                  workspaceId,
                  currentUserId,
                  false,
                  update,
                );
              }
              break;
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ConversationMember",
          filter: `userId=eq.${currentUserId}`,
        },
        async (payload) => {
          const oldData = payload.old as convoMember;
          const newData = payload.new as convoMember;
          const { remove } = useSidebarStore.getState();
          const data = payload.eventType === "DELETE" ? oldData : newData;
          if (data.workspaceId !== workspaceId) return;
          switch (payload.eventType) {
            case "INSERT": {
              upsertSidebar(
                newData.conversationId,
                workspaceId,
                currentUserId,
                false,
              );
              break;
            }
            case "UPDATE": {
              const lastMsg = !!oldData.lastMessageId;
              const newMsg = !!newData.lastMessageId;
              if (!lastMsg && newMsg) {
                upsertSidebar(
                  newData.conversationId,
                  workspaceId,
                  currentUserId,
                  false,
                );
              }
              const wasDeleted = !!oldData.deletedAt;
              const isDeleted = !!newData.deletedAt;

              if ((!wasDeleted && isDeleted) || newData.status === "Left") {
                remove(newData.conversationId);
              }
              if (
                (wasDeleted && !isDeleted) ||
                (newData.status === "Active" &&
                  oldData.status !== newData.status)
              ) {
                upsertSidebar(
                  newData.conversationId,
                  workspaceId,
                  currentUserId,
                  false,
                );
              }
              const wasMuted = !!oldData.mutedAt;
              const isMuted = !!newData.mutedAt;
              const changeMute = () =>
                upsertSidebar(
                  newData.conversationId,
                  workspaceId,
                  currentUserId,
                  true,
                  { mute: newData.mutedFor, mutedAt: newData.mutedAt },
                );
              if (
                oldData.mutedAt &&
                newData.mutedAt &&
                new Date(oldData.mutedAt).getTime !==
                  new Date(newData.mutedAt).getTime
              ) {
                changeMute();
              }
              if (wasMuted && !isMuted) {
                changeMute();
              }
              if (!wasMuted && isMuted) {
                changeMute();
              }
              break;
            }
            case "DELETE": {
              remove(oldData.conversationId);
            }
          }
        },
      )
      .subscribe((status) => {
        console.log("REALTIME CONVERSATION STATUS:", status);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workspaceId, currentUserId]);
}
export async function upsertSidebar(
  id: string,
  workspaceId: string,
  currentUserId: string,
  onlyData: boolean,
  update?: Partial<chatListProps>,
) {
  const { upsert, byId, upsertOnlyData } = useSidebarStore.getState();
  const conversation = byId[id];
  if (onlyData) {
    if (conversation) {
      upsertOnlyData({ id, ...update });
    }
  } else {
    if (!conversation) {
      try {
        const newConvo = await getSingleConversation({
          workspaceId,
          conversationId: id,
        });
        upsert(newConvo.conversation);
      } catch (e) {
        console.error("Failed to fetch single sidebar conversation", e);
      }
    } else {
      if (update?.lastMessage) {
        const unread = update.lastMessage
          ? update.lastMessage.messagedBy.id === currentUserId
            ? 0
            : conversation.unread + 1
          : 0;
        upsert({
          id,
          unread,
          lastActivityAt: update.lastActivityAt,
          lastMessage: update.lastMessage,
        });
        console.log(update.lastActivityAt);
      } else {
        upsert({ id, ...update });
      }
    }
  }
}
