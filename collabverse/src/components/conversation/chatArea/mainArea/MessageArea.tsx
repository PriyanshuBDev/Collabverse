import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import {
  chatReplyProps,
  CompleteChatProps,
  convoDetailsProps,
} from "@/app/interfaces";
import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";
import { DownArrow } from "@/components/svg/Arrows";
import AtTheRateSvg from "@/components/svg/AtTheRateSvg";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import MessageShape from "@/lib/functions/conversation/MessageShape";
import { useChatMessages } from "@/lib/hooks/conversation/useChatMessages";
import Spinner1 from "@/components/loadings/Spinner1";
import { getSortedGroupedMsgs } from "@/lib/functions/chat/getSortedGroupedMsgs";
import { useScrollToMention } from "@/lib/hooks/conversation/useScrollToMention";
import { ChatPinBar } from "../pin/ChatPinBar";
import { selectMsgUserProps } from "./ChatArea";
import ChatBubbleArea from "../bubble/ChatBubbleArea";
import { useHandleScrollToMsg } from "@/lib/hooks/conversation/useHandleScrollToMsg";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { ConversationContext } from "@/components/wrappers/ConversationProvider";
type MessageRow =
  | { type: "date"; key: string; date: string }
  | { type: "unread"; key: string; date: string }
  | {
      type: "message";
      key: string;
      date: string;
      chat: CompleteChatProps;
      group: CompleteChatProps[];
      groupIndex: number;
      unread: boolean;
    };
const LOAD_EDGE_PX = 1400;
export default function MessageArea({
  convoDetails,
  isDeletingRef,
  setSelectedMsgs,
  selectedMsgs,
  showDelete,
  setScrollToBottom,
  setReply,
}: {
  convoDetails: convoDetailsProps;
  isDeletingRef: RefObject<boolean>;
  setSelectedMsgs: Dispatch<SetStateAction<selectMsgUserProps[]>>;
  selectedMsgs: selectMsgUserProps[];
  showDelete: boolean;
  setScrollToBottom: Dispatch<SetStateAction<(() => void) | undefined>>;
  setReply: Dispatch<SetStateAction<chatReplyProps | null>>;
}) {
  const { id: currentChatId, type: currentChatType } = useCurrentConversation();
  const context = useContext(ConversationContext);
  const {
    messages,
    jumpToMessage,
    isLoading,
    loadingTop,
    loadingBottom,
    hasNewer,
    hasOlder,
    markAsRead,
    markAllRead,
    handlePinning,
    fetchNewer,
    showCachedLatest,
    fetchOlder,
  } = useChatMessages();
  const sortedGroupedChats = useMemo(
    () => getSortedGroupedMsgs(messages),
    [messages],
  );
  const [ready, setReady] = useState(false);
  const unreadMessages = useMemo(
    () =>
      sortedGroupedChats.flatMap(
        ([, dayMessages]: [unknown, CompleteChatProps[]]) =>
          dayMessages.filter(
            (message: CompleteChatProps) => !message.isReadByMe,
          ),
      ),
    [sortedGroupedChats],
  );

  const firstUnreadId = unreadMessages[0]?.id;
  const [unreadBarAnchorId, setUnreadBarAnchorId] = useState<string | null>(
    null,
  );
  const [unreadBarDisabled, setUnreadBarDisabled] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [pendingJumpId, setPendingJumpId] = useState<string | null>(null);
  const olderFetchArmed = useRef(true);
  const newerFetchArmed = useRef(true);
  const [unpinAllLoading, setUnpinAllLoading] = useState(false);
  const olderScrollAnchor = useRef<{
    messageId: string;
    offset: number;
    rowCount: number;
  } | null>(null);
  useEffect(() => {
    setUnreadBarAnchorId(null);
    setUnreadBarDisabled(false);
  }, [currentChatId]);

  useEffect(() => {
    if (!unreadBarAnchorId && firstUnreadId) {
      setUnreadBarAnchorId(firstUnreadId);
    }
  }, [firstUnreadId, unreadBarAnchorId]);
  const rows = useMemo<MessageRow[]>(() => {
    const result: MessageRow[] = [];

    for (const [date, dayMessages] of sortedGroupedChats) {
      result.push({ type: "date", key: `date:${date}`, date });

      dayMessages.forEach((chat, groupIndex) => {
        if (
          !unreadBarDisabled &&
          unreadBarAnchorId &&
          chat.id === unreadBarAnchorId
        ) {
          result.push({
            type: "unread",
            key: `unread:${date}`,
            date,
          });
        }

        result.push({
          type: "message",
          key: `message:${chat.id}`,
          date,
          chat,
          group: dayMessages,
          groupIndex,
          unread: !chat.isReadByMe,
        });
      });
    }
    return result;
  }, [sortedGroupedChats, unreadBarAnchorId, unreadBarDisabled]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => chatContainerRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      if (row?.type === "date") return 44;
      if (row?.type === "unread") return 36;
      return 96; // estimate only; the rendered message is measured
    },
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 20,
    anchorTo: "end",
    followOnAppend: false,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const firstVisibleItem = virtualItems.find(
    (item: VirtualItem) => item.end > (virtualizer.scrollOffset ?? 0),
  );
  const currentDate = firstVisibleItem
    ? (rows[firstVisibleItem.index]?.date ?? null)
    : null;

  const handleScroll = () => {
    const el = chatContainerRef.current;

    if (el && context) {
      context.isNearBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
    }
    setShowDate(true);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setShowDate(false), 1200);
  };
  useEffect(() => {
    if (!context) return;
    context.scrollToBottomRef.current = () =>
      virtualizer.scrollToEnd({ behavior: "smooth" });

    return () => {
      context.scrollToBottomRef.current = null;
    };
  }, [virtualizer, context]);
  useEffect(() => {
    setScrollToBottom(() => () => {
      virtualizer.scrollToEnd({ behavior: "smooth" });
      setUnreadBarDisabled(true);
    });
  }, [setScrollToBottom, virtualizer]);
  const didInitialScroll = useRef(false);
  useLayoutEffect(() => {
    didInitialScroll.current = false;
    setReady(false);
    setPendingJumpId(null);
    olderFetchArmed.current = true;
    newerFetchArmed.current = true;
  }, [currentChatId]);
  useLayoutEffect(() => {
    if (firstUnreadId && unreadBarAnchorId !== firstUnreadId) return;
    if (didInitialScroll.current || isLoading || rows.length === 0) return;

    didInitialScroll.current = true;

    const unreadIndex = unreadBarAnchorId
      ? rows.findIndex(
          (row: MessageRow) =>
            row.type === "unread" &&
            row.date ===
              rows.find(
                (candidate: MessageRow) =>
                  candidate.type === "message" &&
                  candidate.chat.id === unreadBarAnchorId,
              )?.date,
        )
      : -1;

    if (unreadIndex >= 0) {
      virtualizer.scrollToIndex(unreadIndex, {
        align: "start",
        behavior: "auto",
      });
    } else {
      virtualizer.scrollToEnd();
    }

    setReady(true);
  }, [isLoading, rows, unreadBarAnchorId, virtualizer, firstUnreadId]);

  const newerFetchInFlight = useRef(false);
  const olderFetchInFlight = useRef(false);

  useEffect(() => {
    if (!ready) return;

    const element = chatContainerRef.current;
    if (!element) return;

    const checkFetchEdges = () => {
      const offset = element.scrollTop;
      const distanceToBottom = Math.max(
        0,
        virtualizer.getTotalSize() - offset - element.clientHeight,
      );

      if (
        hasOlder &&
        !loadingTop &&
        !olderFetchInFlight.current &&
        offset <= LOAD_EDGE_PX
      ) {
        const firstVisibleMessage = virtualItems.find((item: VirtualItem) => {
          const row = rows[item.index];
          return row?.type === "message" && item.end > offset;
        });

        const anchorRow = firstVisibleMessage
          ? rows[firstVisibleMessage.index]
          : null;

        if (anchorRow?.type === "message") {
          olderScrollAnchor.current = {
            messageId: anchorRow.chat.id,
            offset: firstVisibleMessage!.start - offset,
            rowCount: rows.length,
          };
        }

        olderFetchInFlight.current = true;
        void fetchOlder()
          .catch((error) => {
            console.error("Failed to fetch older message:", error);
          })
          .finally(() => {
            olderFetchInFlight.current = false;
          });
      }
      if (
        hasNewer &&
        !loadingBottom &&
        !newerFetchInFlight.current &&
        distanceToBottom <= LOAD_EDGE_PX
      ) {
        newerFetchInFlight.current = true;
        void fetchNewer()
          .catch((error) => {
            console.error("Failed to fetch newer messages:", error);
          })
          .finally(() => {
            newerFetchInFlight.current = false;
          });
      }
    };

    checkFetchEdges();
    element.addEventListener("scroll", checkFetchEdges, { passive: true });

    return () => {
      element.removeEventListener("scroll", checkFetchEdges);
    };
  }, [
    ready,
    hasOlder,
    hasNewer,
    loadingTop,
    loadingBottom,
    fetchOlder,
    fetchNewer,
    virtualizer,
    rows,
    virtualItems,
  ]);
  const getMessageIndex = useCallback(
    (messageId: string) =>
      rows.findIndex(
        (row: MessageRow) =>
          row.type === "message" && row.chat.id === messageId,
      ),
    [rows],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const scroll = () =>
        virtualizer.scrollToIndex(index, {
          align: "center",
          behavior: "auto",
        });

      scroll();
      requestAnimationFrame(scroll);
    },
    [virtualizer],
  );
  useLayoutEffect(() => {
    const anchor = olderScrollAnchor.current;
    if (!anchor || rows.length <= anchor.rowCount) return;

    const index = getMessageIndex(anchor.messageId);
    if (index < 0) return;

    const item = virtualizer
      .getVirtualItems()
      .find((virtualItem: VirtualItem) => virtualItem.index === index);

    if (item) {
      virtualizer.scrollToOffset(item.start - anchor.offset, {
        behavior: "auto",
      });
      olderScrollAnchor.current = null;
    }
  }, [rows, getMessageIndex, virtualizer]);
  const { highlightId, handleScrollTo } = useHandleScrollToMsg({
    getMessageIndex,
    scrollToIndex,
  });

  useLayoutEffect(() => {
    if (!pendingJumpId || getMessageIndex(pendingJumpId) < 0) return;

    handleScrollTo(pendingJumpId);
    setPendingJumpId(null);
  }, [pendingJumpId, getMessageIndex, handleScrollTo]);
  const pendingBottomScroll = useRef(false);

  useLayoutEffect(() => {
    if (!pendingBottomScroll.current) return;

    const frame = requestAnimationFrame(() => {
      virtualizer.scrollToEnd({ behavior: "auto" });

      requestAnimationFrame(() => {
        virtualizer.scrollToEnd({ behavior: "auto" });
        pendingBottomScroll.current = false;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [rows.length, unreadBarDisabled, virtualizer]);
  const jumpToMessageInList = useCallback(
    async (messageId: string) => {
      const message =
        useChatStore.getState().conversations[currentChatId]?.messagesMap[
          messageId
        ];

      if (message) {
        handleScrollTo(messageId);
        return;
      }

      setPendingJumpId(messageId);

      try {
        const found = await jumpToMessage(messageId);
        if (!found) setPendingJumpId(null);
      } catch (error) {
        setPendingJumpId(null);
        throw error;
      }
    },
    [jumpToMessage, currentChatId, handleScrollTo],
  );

  const { remainingMentions, handleScrollToLatestMention, showMention } =
    useScrollToMention(convoDetails, jumpToMessageInList);
  const showScrollButton = rows.length > 0 && !virtualizer.isAtEnd(80);
  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);
  return (
    <>
      {" "}
      {messages.length > 0 ? (
        <>
          {convoDetails.pins.length > 0 && (
            <div
              className={`transition-all duration-300  ${
                !showDelete ? "opacity-100 max-h-13 " : " opacity-0 max-h-0 "
              }`}
            >
              <ChatPinBar
                convoDetails={convoDetails}
                jumpToMsg={jumpToMessageInList}
                type={currentChatType}
                setLoading={setUnpinAllLoading}
              />
            </div>
          )}

          <div className=" flex flex-col flex-1 min-h-0 relative pr-1">
            {(pendingJumpId || unpinAllLoading) && (
              <div className="absolute inset-0 flex items-center justify-center z-100">
                <div className="bg-white/10 backdrop-blur-xl rounded-full lg:p-2 p-1">
                  <Spinner1 size="size-5 lg:size-6" />
                </div>
              </div>
            )}
            {loadingTop && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
                <Spinner1 size="size-4" />
              </div>
            )}
            <div
              className={`absolute top-2 left-1/2 -translate-x-1/2  bg-gray-800  text-white text-xs px-3 py-1 rounded-full shadow transition-all duration-300 pointer-events-none ${
                showDate
                  ? "opacity-80 translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
              aria-hidden
            >
              {currentDate &&
                CommentsDateIndicatorFormatter(new Date(currentDate))}
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: "thin", overflowAnchor: "none" }}
              onScroll={handleScroll}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                  width: "100%",
                }}
              >
                {virtualizer.getVirtualItems().map((item: VirtualItem) => {
                  const row = rows[item.index];
                  if (!row) return null;

                  return (
                    <div
                      key={item.key}
                      data-index={item.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${item.start}px)`,
                      }}
                    >
                      {row.type === "date" && (
                        <div className="px-5 flex justify-center">
                          <div
                            id={`date-${row.date}`}
                            className={`bg-gray-300 dark:bg-blk7 text-gray-700 dark:text-gray-200
                  text-xs px-3 py-1 ml-4 rounded-full shadow my-2 transition-opacity duration-150 ${
                    ready ? "opacity-100" : "opacity-0"
                  }`}
                          >
                            {CommentsDateIndicatorFormatter(new Date(row.date))}
                          </div>
                        </div>
                      )}

                      {row.type === "unread" && (
                        <div className="px-5">
                          <div
                            className="bg-gray-100 dark:bg-blk4 shadow-md lg:text-sm text-xs
                  text-gray-800 dark:text-gray-200 flex justify-center rounded-full py-1"
                          >
                            Unread messages
                          </div>
                        </div>
                      )}

                      {row.type === "message" && (
                        <div className="px-5">
                          <ChatBubbleArea
                            chat={row.chat}
                            convoDetails={convoDetails}
                            jumpToMsg={jumpToMessageInList}
                            highlightId={highlightId}
                            setReply={setReply}
                            {...(row.unread ? { markAsRead } : {})}
                            chatContainerRef={chatContainerRef}
                            setSelectedMsgs={setSelectedMsgs}
                            selectedMsgs={selectedMsgs}
                            isDeletingRef={isDeletingRef}
                            type={currentChatType}
                            shape={MessageShape(
                              row.group,
                              row.groupIndex,
                              row.chat,
                            )}
                            handlePinning={handlePinning}
                            handleScrollTo={handleScrollTo}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {loadingBottom && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10">
                <Spinner1 size="size-4" />
              </div>
            )}
            <div className="absolute bottom-3 right-4 flex flex-col items-center gap-4">
              {showMention && (
                <button
                  onClick={handleScrollToLatestMention}
                  className={`relative cursor-pointer  bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
                    showMention
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-75 pointer-events-none"
                  }`}
                >
                  <AtTheRateSvg size="size-4 lg:size-5"></AtTheRateSvg>
                  <div className="absolute bottom-7 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
                    <div className="transition-opacity duration-150">
                      {remainingMentions}
                    </div>
                  </div>
                </button>
              )}
              {showScrollButton && (
                <button
                  onClick={() => {
                    setUnreadBarDisabled(true);

                    showCachedLatest();

                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        virtualizer.scrollToEnd({ behavior: "smooth" });
                        void markAllRead();
                      });
                    });
                  }}
                  className={`relative cursor-pointer  bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
                    showScrollButton
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-75 pointer-events-none"
                  }`}
                >
                  <DownArrow size={"size-4 lg:size-5"}></DownArrow>
                  {unreadMessages.length > 0 && (
                    <div className="absolute bottom-7 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
                      <div className="transition-opacity duration-150">
                        {unreadMessages.length}
                      </div>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className=" flex flex-col flex-1 min-h-0 items-center justify-center">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center z-100">
              <div className="dark:bg-white/10  bg-gray-300 backdrop-blur-xl rounded-full lg:p-2 p-1">
                <Spinner1 size="size-5 lg:size-6" />
              </div>
            </div>
          ) : (
            <div className="bg-gray-300/30 dark:bg-gray-500/30 text-gray-700 dark:text-gray-300 px-3 py-0.5 rounded-full w-fit shadow-sm">
              No messages yet
            </div>
          )}
        </div>
      )}
    </>
  );
}
