import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "../useCurrentWorkspace";
import useCurrentConversation from "./useCurrentConversation";
import { createEmptyConversation, useChatStore } from "../zustand/useChatStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsErrorToast } from "../useIsErrorToast";
import useCurrentUser from "../useCurrentUser";
import { markMessageAsRead } from "@/lib/axios/workspace/conversation/messages/markMessageAsRead";
import { markAllMessagesAsRead } from "@/lib/axios/workspace/conversation/messages/markAllMessageAsRead";
import {
  chatPinProps,
  chatPins,
  CompleteChatProps,
  convoDetailsProps,
  mentionProps,
} from "@/app/interfaces";
import { togglePin } from "@/lib/axios/workspace/conversation/pin/togglePin";
import { toast } from "sonner";
import { getMessages } from "@/lib/axios/workspace/conversation/messages/getMessages";
import axios from "axios";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";
import { useSidebarStore } from "../zustand/useSidebarStore";
type ReadOptimisticSnapshot = {
  messages: {
    id: string;
    isRead: boolean;
    isReadByMe: boolean;
  }[];
  mentions: {
    messageId: string;
    seen: boolean;
  }[];
  sidebarDecrement: number;
};
type mention = {
  messageId: string;
  seen: boolean;
};
export function useChatMessages() {
  const { id: currentUserId } = useCurrentUser();
  const { user } = useUserAppbar();
  const { id: conversationId } = useCurrentConversation();
  const { id: workspaceId } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const c = useChatStore((s) => s.conversations[conversationId]);
  const convo = c ?? createEmptyConversation();

  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const olderRestoreCursor = useRef<string | null>(null);
  const newerRestoreCursor = useRef<string | null>(null);
  const [hiddenNewerIds, setHiddenNewerIds] = useState<Set<string> | null>(
    null,
  );
  const hiddenNewerIdsRef = useRef<Set<string> | null>(null);
  const newerFetchLock = useRef(false);
  const updateHiddenNewerIds = useCallback((ids: Set<string> | null) => {
    hiddenNewerIdsRef.current = ids;
    setHiddenNewerIds(ids);
  }, []);
  const [hiddenOlderIds, setHiddenOlderIds] = useState<Set<string> | null>(
    null,
  );
  const hiddenOlderIdsRef = useRef<Set<string> | null>(null);

  const updateHiddenOlderIds = useCallback((ids: Set<string> | null) => {
    hiddenOlderIdsRef.current = ids;
    setHiddenOlderIds(ids);
  }, []);

  const messageTime = (message: CompleteChatProps) =>
    new Date(message.sentAt ?? message.createdAt).getTime();

  const compareMessages = useCallback(
    (a: CompleteChatProps, b: CompleteChatProps) =>
      messageTime(a) - messageTime(b) || a.id.localeCompare(b.id),
    [],
  );
  const shouldFetch =
    !convo ||
    convo.orderedIds.length === 0 ||
    Date.now() - convo.lastFetchedAt > 1000 * 60;
  const initConversation = useChatStore((s) => s.initConversation);

  useEffect(() => {
    if (conversationId) {
      initConversation(conversationId);
    }
  }, [conversationId, initConversation]);
  const initialQueryKey = [
    workspaceId,
    "conversation",
    conversationId,
    "messages-initial",
  ];
  const {
    data: initialData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: initialQueryKey,
    queryFn: () =>
      getMessages({
        workspaceId: workspaceId,
        conversationId: conversationId,
        mode: "latest",
      }),
    enabled: !!workspaceId && !!conversationId && shouldFetch,
  });
  useIsErrorToast(isError, "Failed to fetch messages", error);
  useEffect(() => {
    if (!initialData) return;
    const { upsertMessages, setCursors, setWindow } = useChatStore.getState();
    upsertMessages(conversationId, initialData.messages);
    setCursors(conversationId, initialData.topCursor, initialData.bottomCursor);
    const state = useChatStore.getState();
    const convo = state.conversations[conversationId];
    if (!convo) return;
    setWindow(
      conversationId,
      convo.orderedIds.length - 50,
      convo.orderedIds.length,
    );
  }, [initialData, conversationId]);

  const fetchOlder = useCallback(async () => {
    if (loadingTop) return;

    setLoadingTop(true);

    try {
      const state = useChatStore.getState();
      const current = state.conversations[conversationId];
      const topCursor = current?.topCursor;

      if (!current || !topCursor) return;

      const res = await queryClient.fetchQuery({
        queryKey: [
          workspaceId,
          "conversation",
          conversationId,
          "messages-before",
          topCursor,
        ],
        queryFn: () =>
          getMessages({
            workspaceId,
            conversationId,
            cursor: topCursor,
            mode: "before",
          }),
      });

      const bridgeIds = hiddenOlderIdsRef.current;
      const reachedCachedRange =
        bridgeIds !== null &&
        res.messages.some((message) => bridgeIds.has(message.id));

      state.upsertMessages(conversationId, res.messages);
      state.expandWindowUp(conversationId, res.messages.length);

      const latest = useChatStore.getState().conversations[conversationId];

      if (reachedCachedRange || !res.topCursor) {
        updateHiddenOlderIds(null);

        state.setCursors(
          conversationId,
          olderRestoreCursor.current,
          latest.bottomCursor,
        );

        olderRestoreCursor.current = null;
      } else {
        state.setCursors(conversationId, res.topCursor, latest.bottomCursor);
      }
    } finally {
      setLoadingTop(false);
    }
  }, [
    conversationId,
    workspaceId,
    loadingTop,
    queryClient,
    updateHiddenOlderIds,
  ]);
  const fetchNewerPage = useCallback(async () => {
    const state = useChatStore.getState();
    const current = state.conversations[conversationId];
    const bottomCursor = current?.bottomCursor;

    if (!current || !bottomCursor) return false;

    const res = await queryClient.fetchQuery({
      queryKey: [
        workspaceId,
        "conversation",
        conversationId,
        "messages-after",
        bottomCursor,
      ],
      queryFn: () =>
        getMessages({
          workspaceId,
          conversationId,
          cursor: bottomCursor,
          mode: "after",
        }),
    });

    const bridgeIds = hiddenNewerIdsRef.current;
    const reachedCachedLatest =
      bridgeIds !== null &&
      res.messages.some((message) => bridgeIds.has(message.id));

    const latestState = useChatStore.getState();
    latestState.upsertMessages(conversationId, res.messages);
    latestState.expandWindowDown(conversationId, res.messages.length);

    if (reachedCachedLatest || !res.bottomCursor) {
      updateHiddenNewerIds(null);

      latestState.setCursors(
        conversationId,
        current.topCursor,
        newerRestoreCursor.current,
      );

      newerRestoreCursor.current = null;
      return false;
    }

    latestState.setCursors(conversationId, current.topCursor, res.bottomCursor);
    return true;
  }, [conversationId, workspaceId, queryClient, updateHiddenNewerIds]);

  const fetchNewer = useCallback(async () => {
    if (newerFetchLock.current) return;

    newerFetchLock.current = true;
    setLoadingBottom(true);

    try {
      await fetchNewerPage();
    } finally {
      newerFetchLock.current = false;
      setLoadingBottom(false);
    }
  }, [fetchNewerPage]);

  const fetchNewerUntilLatest = useCallback(async () => {
    if (newerFetchLock.current) return;

    newerFetchLock.current = true;
    setLoadingBottom(true);

    try {
      while (await fetchNewerPage()) {
        // Fetch one page at a time until it overlaps the cached latest range.
      }
    } finally {
      newerFetchLock.current = false;
      setLoadingBottom(false);
    }
  }, [fetchNewerPage]);
  const jumpToMessage = useCallback(
    async (messageId: string) => {
      const res = await queryClient.fetchQuery({
        queryKey: [
          workspaceId,
          "conversation",
          conversationId,
          "message-around",
          messageId,
        ],
        queryFn: () =>
          getMessages({
            workspaceId: workspaceId,
            conversationId: conversationId,
            cursor: messageId,
            mode: "around",
          }),
      });
      if (res?.messages.length > 0) {
        const aroundIds = new Set(
          res.messages.map((message: CompleteChatProps) => message.id),
        );

        const aroundFirst = res.messages.reduce((first, message) =>
          compareMessages(message, first) < 0 ? message : first,
        );
        const aroundLast = res.messages.reduce((last, message) =>
          compareMessages(message, last) > 0 ? message : last,
        );

        const existing = useChatStore.getState().conversations[conversationId];
        olderRestoreCursor.current = existing?.topCursor ?? null;
        newerRestoreCursor.current = existing?.bottomCursor ?? null;
        const cachedMessages = (existing?.orderedIds ?? [])
          .map((id: string) => existing!.messagesMap[id])
          .filter(Boolean);

        const cachedOlderIds = new Set(
          cachedMessages
            .filter(
              (message: CompleteChatProps) =>
                !aroundIds.has(message.id) &&
                compareMessages(message, aroundFirst) < 0,
            )
            .map((message: CompleteChatProps) => message.id),
        );

        const cachedNewerIds = new Set(
          cachedMessages
            .filter(
              (message: CompleteChatProps) =>
                !aroundIds.has(message.id) &&
                compareMessages(message, aroundLast) > 0,
            )
            .map((message: CompleteChatProps) => message.id),
        );

        updateHiddenOlderIds(cachedOlderIds.size ? cachedOlderIds : null);
        updateHiddenNewerIds(cachedNewerIds.size ? cachedNewerIds : null);
        const state = useChatStore.getState();
        state.upsertMessages(conversationId, res.messages);
        state.setCursors(conversationId, res.topCursor, res.bottomCursor);

        const updated = useChatStore.getState().conversations[conversationId];
        const index = updated.orderedIds.indexOf(messageId);
        state.setWindow(conversationId, index - 25, index + 25);

        return true;
      }
      return false;
    },
    [
      workspaceId,
      conversationId,
      queryClient,
      compareMessages,
      updateHiddenNewerIds,
      updateHiddenOlderIds,
    ],
  );
  const allMessages = convo.orderedIds.map(
    (id: string) => convo.messagesMap[id],
  );
  const messages = allMessages.filter(
    (message: CompleteChatProps) =>
      !hiddenOlderIds?.has(message.id) && !hiddenNewerIds?.has(message.id),
  );
  const markAllRead = async () => {
    await markAllMsgsRead(conversationId, workspaceId, currentUserId);
    useSidebarStore.getState().upsert({ id: conversationId, unread: 0 });
  };
  const pendingReadMessageId = useRef<string | null>(null);
  const pendingReadSnapshot = useRef<ReadOptimisticSnapshot>({
    messages: [],
    mentions: [],
    sidebarDecrement: 0,
  });
  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readRequestInFlight = useRef(false);

  const applyReadOptimistically = useCallback(
    (throughMessageId: string): ReadOptimisticSnapshot => {
      const snapshot: ReadOptimisticSnapshot = {
        messages: [],
        mentions: [],
        sidebarDecrement: 0,
      };

      const current = useChatStore.getState().conversations[conversationId];
      if (!current) return snapshot;

      const targetIndex = current.orderedIds.indexOf(throughMessageId);
      if (targetIndex === -1) return snapshot;

      const newlyReadIds: string[] = [];

      for (const id of current.orderedIds.slice(0, targetIndex + 1)) {
        const message = current.messagesMap[id];
        if (
          !message ||
          message.user.id === currentUserId ||
          message.isReadByMe
        ) {
          continue;
        }

        snapshot.messages.push({
          id,
          isRead: message.isRead,
          isReadByMe: message.isReadByMe,
        });
        newlyReadIds.push(id);

        useChatStore.getState().updateMessages(conversationId, id, {
          isRead: true,
          isReadByMe: true,
        });
      }

      const detailsKey = [
        workspaceId,
        "conversation",
        conversationId,
        "details",
      ] as const;

      const details = queryClient.getQueryData<convoDetailsProps>(detailsKey);
      const newlySeenMentions = details?.mentions.filter(
        (mention: mentionProps) =>
          newlyReadIds.includes(mention.messageId) && !mention.seen,
      );

      if (newlySeenMentions?.length) {
        snapshot.mentions = newlySeenMentions.map((mention: mentionProps) => ({
          messageId: mention.messageId,
          seen: mention.seen,
        }));

        queryClient.setQueryData<convoDetailsProps>(
          detailsKey,
          (oldData: convoDetailsProps | undefined) =>
            oldData
              ? {
                  ...oldData,
                  mentions: oldData.mentions.map((mention: mentionProps) =>
                    newlyReadIds.includes(mention.messageId)
                      ? { ...mention, seen: true }
                      : mention,
                  ),
                }
              : oldData,
        );
      }
      const sidebar = useSidebarStore.getState();
      const unread = sidebar.byId[conversationId]?.unread ?? 0;
      snapshot.sidebarDecrement = Math.min(unread, newlyReadIds.length);

      if (snapshot.sidebarDecrement > 0) {
        sidebar.upsert({
          id: conversationId,
          unread: unread - snapshot.sidebarDecrement,
        });
      }

      return snapshot;
    },
    [conversationId, currentUserId, queryClient, workspaceId],
  );

  const rollbackReadOptimistic = useCallback(
    (snapshot: ReadOptimisticSnapshot) => {
      const state = useChatStore.getState();
      const current = state.conversations[conversationId];

      for (const previous of snapshot.messages) {
        if (current?.messagesMap[previous.id]) {
          state.updateMessages(conversationId, previous.id, {
            isRead: previous.isRead,
            isReadByMe: previous.isReadByMe,
          });
        }
      }

      const detailsKey = [
        workspaceId,
        "conversation",
        conversationId,
        "details",
      ] as const;
      const previousMentions = new Map(
        snapshot.mentions.map((mention: mention) => [
          mention.messageId,
          mention.seen,
        ]),
      );

      if (previousMentions.size) {
        queryClient.setQueryData<convoDetailsProps>(
          detailsKey,
          (oldData: convoDetailsProps | undefined) =>
            oldData
              ? {
                  ...oldData,
                  mentions: oldData.mentions.map((mention: mentionProps) =>
                    previousMentions.has(mention.messageId)
                      ? {
                          ...mention,
                          seen: previousMentions.get(mention.messageId)!,
                        }
                      : mention,
                  ),
                }
              : oldData,
        );
      }

      if (snapshot.sidebarDecrement > 0) {
        const sidebar = useSidebarStore.getState();
        const unread = sidebar.byId[conversationId]?.unread ?? 0;

        sidebar.upsert({
          id: conversationId,
          unread: unread + snapshot.sidebarDecrement,
        });
      }
    },
    [conversationId, queryClient, workspaceId],
  );

  const flushPendingRead = useCallback(async () => {
    if (readRequestInFlight.current) return;

    const messageId = pendingReadMessageId.current;
    if (!messageId) return;

    pendingReadMessageId.current = null;

    const snapshot = pendingReadSnapshot.current;
    pendingReadSnapshot.current = {
      messages: [],
      mentions: [],
      sidebarDecrement: 0,
    };

    readRequestInFlight.current = true;

    try {
      await markMessageAsRead({
        workspaceId,
        conversationId,
        messageId,
      });
    } catch (error) {
      console.error(
        "Failed to mark messages as read through",
        messageId,
        error,
      );

      rollbackReadOptimistic(snapshot);

      // A newer message may have become visible while this request was running.
      // Reapply optimism through that newer message before sending its request.
      const pendingId = pendingReadMessageId.current;
      if (pendingId) {
        const retrySnapshot = applyReadOptimistically(pendingId);
        pendingReadSnapshot.current.messages.push(...retrySnapshot.messages);
        pendingReadSnapshot.current.mentions.push(...retrySnapshot.mentions);
        pendingReadSnapshot.current.sidebarDecrement +=
          retrySnapshot.sidebarDecrement;
      }
    } finally {
      readRequestInFlight.current = false;

      if (pendingReadMessageId.current) {
        void flushPendingRead();
      }
    }
  }, [
    applyReadOptimistically,
    conversationId,
    rollbackReadOptimistic,
    workspaceId,
  ]);

  const markAsRead = useCallback(
    (id: string) => {
      const current = useChatStore.getState().conversations[conversationId];
      if (!current) return;

      const newIndex = current.orderedIds.indexOf(id);
      if (newIndex === -1) return;

      const pendingId = pendingReadMessageId.current;
      const pendingIndex = pendingId
        ? current.orderedIds.indexOf(pendingId)
        : -1;

      // Keep the furthest message seen during this debounce window.
      if (pendingIndex === -1 || newIndex > pendingIndex) {
        pendingReadMessageId.current = id;
      }

      const throughId = pendingReadMessageId.current;
      if (!throughId) return;

      const snapshot = applyReadOptimistically(throughId);
      pendingReadSnapshot.current.messages.push(...snapshot.messages);
      pendingReadSnapshot.current.mentions.push(...snapshot.mentions);
      pendingReadSnapshot.current.sidebarDecrement += snapshot.sidebarDecrement;

      if (readTimer.current) clearTimeout(readTimer.current);

      readTimer.current = setTimeout(() => {
        void flushPendingRead();
      }, 300);
    },
    [applyReadOptimistically, conversationId, flushPendingRead],
  );

  useEffect(() => {
    return () => {
      if (readTimer.current) clearTimeout(readTimer.current);
    };
  }, []);

  const handlePinning = async (msgId: string, enabled: boolean) => {
    const state = useChatStore.getState();
    const convo = state.conversations[conversationId];
    const msg = convo.messagesMap[msgId];
    let pinnedAt: Date = new Date();
    if (msg.id) {
      state.updateMessages(conversationId, msgId, { isPinned: enabled });
      const date = new Date();
      const id = crypto.randomUUID();
      queryClient.setQueryData<convoDetailsProps>(
        [workspaceId, "conversation", conversationId, "details"],
        (oldData: convoDetailsProps | undefined) => {
          if (!oldData) return oldData;
          const pinDate = oldData.pins.find(
            (p: chatPins) => p.messageId === msgId,
          )?.pinnedAt;
          if (!enabled && pinDate) {
            pinnedAt = pinDate;
          }
          return {
            ...oldData,
            pins: enabled
              ? [
                  ...oldData.pins,
                  {
                    id,
                    message: {
                      type: msg.type,
                      message: msg.message,
                      name: msg.media[0]?.name,
                      duration: msg.media[0]?.duration,
                    },
                    messageId: msgId,
                    pinnedAt: new Date(),
                    pinnedById: currentUserId,
                    isDeletedForUser: msg.isDeletedForUser,
                  },
                ]
              : oldData.pins.filter((pin: chatPins) => pin.messageId === msgId),
          };
        },
      );
      queryClient.setQueryData<chatPinProps[]>(
        [workspaceId, "conversation", conversationId, "messages", "pinned"],
        (oldData: chatPinProps[] | undefined) => {
          if (!oldData) return oldData;
          if (enabled) {
            return [
              ...oldData,
              {
                ...msg,
                pinnedAt: date,
                pinnedBy: {
                  id: currentUserId,
                  name: user?.name ?? "",
                  avatar: user?.avatar,
                },
              },
            ];
          } else {
            const data = oldData.filter((c: chatPinProps) => c.id !== msgId);
            return data;
          }
        },
      );
    }

    try {
      const pinLength = (
        await togglePin({ workspaceId, conversationId, msgId, enabled })
      ).data.pinLength;
      toast.success(
        `Message ${enabled ? "pinned" : "unpinned"} successfully. (${pinLength}/20)`,
      );
    } catch (e: unknown) {
      if (axios.isAxiosError<ApiError>(e)) {
        toast.error(getApiErrorMessage(e, "Something went wrong"));
      } else {
        toast.error(`Failed to ${enabled ? "pin" : "unpin"} message`);
      }

      console.error(e);
      if (msg.id) {
        state.updateMessages(conversationId, msgId, { isPinned: !enabled });

        queryClient.setQueryData<convoDetailsProps>(
          [workspaceId, "conversation", conversationId, "details"],
          (oldData: convoDetailsProps | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pins: !enabled
                ? [
                    ...oldData.pins,
                    {
                      id: crypto.randomUUID(),
                      message: {
                        type: msg.type,
                        message: msg.message,
                        name: msg.media[0]?.name,
                        duration: msg.media[0]?.duration,
                      },
                      messageId: msgId,
                      pinnedAt,
                      pinnedById: currentUserId,
                      isDeletedForUser: msg.isDeletedForUser,
                    },
                  ]
                : oldData.pins.filter(
                    (pin: chatPins) => pin.messageId === msgId,
                  ),
            };
          },
        );
        queryClient.setQueryData<chatPinProps[]>(
          [workspaceId, "conversation", conversationId, "messages", "pinned"],
          (oldData: chatPinProps[] | undefined) => {
            if (!oldData) return oldData;
            if (!enabled) {
              return [
                ...oldData,
                {
                  ...msg,
                  pinnedAt,
                  pinnedBy: {
                    id: currentUserId,
                    name: user?.name ?? "",
                    avatar: user?.avatar,
                  },
                },
              ];
            } else {
              const data = oldData.filter((c: chatPinProps) => c.id === msgId);
              return data;
            }
          },
        );
      }
    }
  };
  const showCachedLatest = () => {
    updateHiddenNewerIds(null);

    const current = useChatStore.getState().conversations[conversationId];
    if (current && newerRestoreCursor.current !== null) {
      useChatStore
        .getState()
        .setCursors?.(
          conversationId,
          current.topCursor,
          newerRestoreCursor.current,
        );
    }

    newerRestoreCursor.current = null;
  };
  return {
    messages,
    loadingBottom,
    loadingTop,
    hasOlder: !!convo.topCursor,
    hasNewer: !!convo.bottomCursor,
    fetchOlder,
    fetchNewerUntilLatest,
    fetchNewer,
    jumpToMessage,
    isLoading,
    markAsRead,
    markAllRead,
    handlePinning,
    showCachedLatest,
  };
}
export const markAllMsgsRead = async (
  convoId: string,
  workspaceId: string,
  userId: string,
) => {
  const state = useChatStore.getState();
  const convo = state.conversations[convoId];
  const messages = convo.orderedIds
    .slice(convo.startIndex, convo.endIndex)
    .map((id: string) => convo.messagesMap[id]);
  const unReads = messages
    .filter((m: CompleteChatProps) => m.user.id !== userId && !m.isRead)
    .map((m: CompleteChatProps) => m.id);
  unReads.forEach((id) =>
    state.updateMessages(convoId, id, {
      isRead: true,
    }),
  );
  try {
    await markAllMessagesAsRead({
      workspaceId,
      conversationId: convoId,
    });
  } catch (e) {
    console.error(e);
  }
};
