"use client";
import { useCallback, useEffect } from "react";
import { useAllConversationIds } from "@/lib/queries/workspace/conversation/useAllConversationIds";
import { useIsErrorToast } from "../../useIsErrorToast";
import {
  DbCall,
  DbMedia,
  DbMention,
  DbMessage,
  DbPin,
  DbReaction,
  DbReceipt,
  useChatStore,
} from "../../zustand/useChatStore";
import {
  allConversationResProps,
  chatListProps,
  chatPins,
  CompleteChatProps,
  convoDetailsProps,
  memberProps,
  mentionProps,
} from "@/app/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "../../useCurrentWorkspace";
import useCurrentUser from "../../useCurrentUser";
import { scheduleUpdate } from "@/lib/functions/chat/scheduleUpdate";
import { isDuplicateEvent } from "@/lib/functions/chat/isDuplicateEvent";
import { useConvoChannelRT } from "@/components/wrappers/ConvoRtChannelProvider";
import { getMessagePreview } from "@/lib/functions/conversation/getMessagePreview";
import { createReplyTo } from "@/lib/functions/chat/createReplyTo";
import { convoDB, convoMember } from "./useConvoSidebarRT";
import { useSidebarStore } from "../../zustand/useSidebarStore";
import { getSingleConversation } from "@/lib/axios/workspace/conversation/sidebar/getSingleConversation";

export function useConversationRT(
  activeConversationIdRef: React.RefObject<string | null>,
  isNearBottomRef: React.RefObject<boolean>,
  scrollToBottomRef: React.RefObject<(() => void) | null>,
) {
  const { id: currentUserId } = useCurrentUser();
  const { id: workspaceId } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAllConversationIds();
  useIsErrorToast(isError, "Failed to fetch conversations", error);
  const { channel, markReady } = useConvoChannelRT();
  const Active = useCallback(
    (conversationId: string) => {
      if (!data) return false;
      const currentData = data.find(
        (d: allConversationResProps) => d.id === conversationId,
      );
      if (!currentData) return false;
      if (
        currentData.convo.type === "Group" &&
        currentData.convo.status !== "Active"
      ) {
        return false;
      }
      return true;
    },
    [data],
  );
  useEffect(() => {
    if (!channel || isLoading || !data) return;

    const { expandWindowDown } = useChatStore.getState();
    channel
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
                const lastMessage = await waitForMessage(
                  newData.id,
                  newData.lastMessageId,
                );
                if (lastMessage?.user?.id === currentUserId) return;
                if (!lastMessage) {
                  // Last resort: the message event may have been missed or the chat is unopened.
                  const latest = await getSingleConversation({
                    workspaceId,
                    conversationId: newData.id,
                  });
                  useSidebarStore.getState().upsert(latest.conversation);
                  break;
                }
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
          const row =
            payload.eventType === "DELETE" ? payload.old : payload.new;
          if (row.workspaceId !== workspaceId) return;

          const remove = useSidebarStore.getState().remove;
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
      );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Message",
      },
      async (payload) => {
        const messagePayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbMessage)
            : (payload.new as DbMessage);
        if (
          data &&
          !data.find(
            (d: allConversationResProps) =>
              d.id === messagePayload.conversationId,
          )
        )
          return;
        if (
          isDuplicateEvent(payload.table, payload.eventType, messagePayload.id)
        )
          return;
        const currentData = data.find(
          (d: allConversationResProps) =>
            d.id === messagePayload.conversationId,
        );
        if (!currentData) return;
        if (
          currentData.convo.type === "Group" &&
          currentData.convo.status !== "Active"
        ) {
          return;
        }
        switch (payload.eventType) {
          case "INSERT": {
            const conversationId = messagePayload.conversationId;

            const sentBy: memberProps = currentData.users.find(
              (u: memberProps) => u.id === messagePayload.senderId,
            ) ?? {
              id: messagePayload.senderId,
              name: "unknown",
              avatar: undefined,
              username: "unknown",
            };
            if (sentBy.id === currentUserId) return;
            const message: CompleteChatProps = {
              id: messagePayload.id,
              type: messagePayload.type,
              message: messagePayload.content ?? undefined,
              createdAt: messagePayload.createdAt,
              sentAt: messagePayload.sentAt,
              editedAt: messagePayload.editedAt ?? null,
              isDeleted: messagePayload.isDeleted,
              isForwarded: messagePayload.isForwarded,
              media: [],
              reactions: [],
              isRead: false,
              isDeletedForUser: false,
              isPinned: false,
              user: sentBy,
              replyTo: messagePayload.replyPreview
                ? createReplyTo(messagePayload.replyPreview)
                : undefined,
              isReadByMe: false,
              replyToMsgId: messagePayload.replyToMessageId ?? undefined,
            };
            const shouldFollow =
              conversationId === activeConversationIdRef.current &&
              isNearBottomRef.current;
            scheduleUpdate(() => {
              const chatStore = useChatStore.getState();

              chatStore.addMessageRT(conversationId, message, currentUserId);

              const convo =
                useChatStore.getState().conversations[conversationId];
              if (!convo) return;

              const isNearBottom = convo.orderedIds.length - convo.endIndex < 5;
              if (isNearBottom) {
                expandWindowDown(conversationId, 1);
              }

              if (shouldFollow) {
                requestAnimationFrame(() => {
                  scrollToBottomRef.current?.();
                });
              }
            });

            break;
          }
          case "UPDATE": {
            //Also update msgs that is a reply to this message
            const conversationId = messagePayload.conversationId;
            scheduleUpdate(() => {
              useChatStore
                .getState()
                .updateMessages(conversationId, messagePayload.id, {
                  message: messagePayload.content ?? undefined,
                  editedAt: messagePayload.editedAt,
                  isDeleted: messagePayload.isDeleted,
                });
            });
            const sidebarState = useSidebarStore.getState();
            const lastMessage = sidebarState.byId[conversationId].lastMessage;
            if (lastMessage && lastMessage.id === messagePayload.id) {
              sidebarState.upsertOnlyData({
                id: conversationId,
                lastMessage: {
                  ...lastMessage,
                  isDeleted: messagePayload.isDeleted,
                },
              });
            }
            queryClient.setQueryData<convoDetailsProps>(
              [workspaceId, "conversation", conversationId, "details"],
              (oldData: convoDetailsProps | undefined) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pins: oldData.pins.filter(
                    (p: chatPins) => p.messageId !== messagePayload.id,
                  ),
                };
              },
            );

            break;
          }
          case "DELETE": {
            const conversationId = messagePayload.conversationId;
            scheduleUpdate(() => {
              useChatStore
                .getState()
                .deleteMessage(conversationId, messagePayload.id);
            });

            queryClient.setQueryData<convoDetailsProps>(
              [workspaceId, "conversation", conversationId, "details"],
              (oldData: convoDetailsProps | undefined) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pins: oldData.pins.filter(
                    (p: chatPins) => p.messageId !== messagePayload.id,
                  ),
                };
              },
            );
            queryClient.invalidateQueries({
              queryKey: [
                workspaceId,
                "conversation",
                conversationId,
                "messages",
                "pinnned",
              ],
            });
            break;
          }
        }
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "MessageReaction",
      },
      async (payload) => {
        const reactionPayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbReaction)
            : (payload.new as DbReaction);
        if (reactionPayload.userId === currentUserId) return;
        const conversationId = reactionPayload.conversationId;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        if (
          isDuplicateEvent(payload.table, payload.eventType, reactionPayload.id)
        )
          return;

        scheduleUpdate(() => {
          useChatStore.getState().handleUpdateRT(
            conversationId,
            reactionPayload.messageId,
            {
              type: "reaction",
              data: reactionPayload,
              event: payload.eventType,
            },
            currentUserId,
          );
        });
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "MessageReceipt",
      },
      async (payload) => {
        const receiptPayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbReceipt)
            : (payload.new as DbReceipt);
        const conversationId = receiptPayload.conversationId;
        if (receiptPayload.userId === currentUserId) return;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        if (
          isDuplicateEvent(payload.table, payload.eventType, receiptPayload.id)
        )
          return;

        scheduleUpdate(() => {
          useChatStore.getState().handleUpdateRT(
            conversationId,
            receiptPayload.messageId,
            {
              type: "receipt",
              data: receiptPayload,
              event: payload.eventType,
            },
            currentUserId,
          );
          const lastMsg =
            useSidebarStore.getState().byId[conversationId].lastMessage;
          if (lastMsg && lastMsg.id === receiptPayload.messageId) {
            const upsert = useSidebarStore.getState().upsert;
            upsert({
              id: conversationId,
              lastMessage: { ...lastMsg, isRead: true },
            });
          }
        });
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "MessageMedia",
      },
      async (payload) => {
        const mediaPayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbMedia)
            : (payload.new as DbMedia);
        if (
          useChatStore.getState().conversations[mediaPayload.conversationId]
            ?.messagesMap[mediaPayload.messageId]?.user?.id === currentUserId
        )
          return;
        const conversationId = mediaPayload.conversationId;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        if (isDuplicateEvent(payload.table, payload.eventType, mediaPayload.id))
          return;

        scheduleUpdate(() => {
          useChatStore.getState().handleUpdateRT(
            conversationId,
            mediaPayload.messageId,
            {
              type: "media",
              data: mediaPayload,
              event: payload.eventType,
            },
            currentUserId,
          );
        });
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "MessagePin",
      },
      async (payload) => {
        const pinPayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbPin)
            : (payload.new as DbPin);

        if (pinPayload.pinnedById === currentUserId) return;
        const conversationId = pinPayload.conversationId;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        if (isDuplicateEvent(payload.table, payload.eventType, pinPayload.id))
          return;

        scheduleUpdate(() => {
          useChatStore.getState().handleUpdateRT(
            conversationId,
            pinPayload.messageId,
            {
              type: "pin",
              data: pinPayload,
              event: payload.eventType,
            },
            currentUserId,
          );
        });
        queryClient.setQueryData<convoDetailsProps>(
          [workspaceId, "conversation", conversationId, "details"],
          (oldData: convoDetailsProps | undefined) => {
            if (!oldData) return oldData;
            if (payload.eventType === "INSERT") {
              return {
                ...oldData,
                pins: [
                  ...oldData.pins,
                  {
                    ...pinPayload,
                    message: getMessagePreview(pinPayload.messagePreview),
                    isDeletedForUser:
                      pinPayload.deletedFor.includes(currentUserId),
                  },
                ],
              };
            } else if (payload.eventType === "UPDATE") {
              return {
                ...oldData,
                pins: [
                  ...oldData.pins.map((p: chatPins) => {
                    if (p.id === pinPayload.id) {
                      return {
                        ...p,
                        isDeletedForUser:
                          pinPayload.deletedFor.includes(currentUserId),
                      };
                    } else {
                      return p;
                    }
                  }),
                ],
              };
            } else if (payload.eventType === "DELETE") {
              return {
                ...oldData,
                pins: oldData.pins.filter(
                  (p: chatPins) => p.id !== pinPayload.id,
                ),
              };
            }
          },
        );
        queryClient.invalidateQueries({
          queryKey: [
            workspaceId,
            "conversation",
            conversationId,
            "messages",
            "pinned",
          ],
        });
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "MessageMention",
      },
      async (payload) => {
        const mentionPayload =
          payload.eventType === "DELETE"
            ? (payload.old as DbMention)
            : (payload.new as DbMention);

        const conversationId = mentionPayload.conversationId;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        if (
          isDuplicateEvent(payload.table, payload.eventType, mentionPayload.id)
        )
          return;

        if (mentionPayload.mentionedUserId === currentUserId) {
          if (payload.eventType === "INSERT") {
            queryClient.setQueryData<convoDetailsProps>(
              [workspaceId, "conversation", conversationId, "details"],
              (oldData: convoDetailsProps | undefined) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  mentions: [
                    ...oldData.mentions,
                    {
                      id: mentionPayload.id,
                      messageId: mentionPayload.messageId,
                      userId: mentionPayload.mentionedUserId,
                      seen: mentionPayload.seen,
                      date: mentionPayload.createdAt,
                    },
                  ],
                };
              },
            );
          } else {
            queryClient.setQueryData<convoDetailsProps>(
              [workspaceId, "conversation", conversationId, "details"],
              (oldData: convoDetailsProps | undefined) => {
                if (!oldData) return oldData;
                const mentions = oldData.mentions.filter(
                  (m: mentionProps) => m.id !== mentionPayload.id,
                );
                if (payload.eventType === "DELETE") {
                  return {
                    ...oldData,
                    mentions,
                  };
                } else {
                  return {
                    ...oldData,
                    mentions: [
                      ...mentions,
                      {
                        id: mentionPayload.id,
                        messageId: mentionPayload.messageId,
                        userId: mentionPayload.mentionedUserId,
                        seen: mentionPayload.seen,
                        date: mentionPayload.createdAt,
                      },
                    ],
                  };
                }
              },
            );
          }
        }
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "CallSession",
      },
      async (payload) => {
        if (payload.eventType !== "UPDATE") return;
        const callPayload = payload.new as DbCall;
        const conversationId = callPayload.conversationId;
        if (
          data &&
          !data.find((d: allConversationResProps) => d.id === conversationId)
        )
          return;
        if (!Active(conversationId)) return;
        const msgId = Object.values(
          useChatStore.getState().conversations[callPayload.conversationId]
            .messagesMap,
        ).find((m: CompleteChatProps) => m.call?.id === callPayload.id)?.id;
        if (!msgId) return;

        useChatStore.getState().handleUpdateRT(
          conversationId,
          msgId,
          {
            type: "call",
            data: callPayload,
            event: payload.eventType,
          },
          currentUserId,
        );
      },
    );
    markReady("postgres");
  }, [
    markReady,
    data,
    isLoading,
    channel,
    queryClient,
    workspaceId,
    currentUserId,
    isNearBottomRef,
    scrollToBottomRef,
    Active,
    activeConversationIdRef,
  ]);
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
          lastActivityAt: new Date(),
          lastMessage: update.lastMessage,
        });
      } else {
        upsert({ id, ...update });
      }
    }
  }
}
async function waitForMessage(
  conversationId: string,
  messageId: string,
  attempts = 6,
): Promise<CompleteChatProps | undefined> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const message =
      useChatStore.getState().conversations[conversationId]?.messagesMap?.[
        messageId
      ];

    if (message) return message;

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return undefined;
}
