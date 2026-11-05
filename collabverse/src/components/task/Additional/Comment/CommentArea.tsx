"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommentChatBubble from "../../../ChatComponents/CommentChatBubble";
import {
  commentReplyProps,
  CompleteCommentProps,
} from "../../../../app/interfaces";
import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";
import InputEditor from "../../../ChatComponents/InputEditor";
import { useAllTaskUsers } from "@/lib/queries/workspace/project/task/users/useAllTaskUsers";
import Spinner1 from "@/components/loadings/Spinner1";
import { useComments } from "@/lib/hooks/comment/useComments";
import { useScrollToCommentMention } from "@/lib/hooks/comment/useScrollToCommentMention";
import { useCommentMentions } from "@/lib/queries/workspace/project/task/comment/useCommentMentions";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { getSortedGroupedComments } from "@/lib/functions/comment/getSortedGroupedComments";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { useTaskCommentView } from "@/components/wrappers/TaskCommentRealtimeHost";
import { useHandleScrollToComment } from "@/lib/hooks/comment/useHandleScrollToComment";
import { useCommentStore } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import AtTheRateSvg from "@/components/svg/AtTheRateSvg";
import { DownArrow } from "@/components/svg/Arrows";
type CommentRow =
  | { type: "date"; key: string; date: string }
  | { type: "unread"; key: string; date: string }
  | {
      type: "comment";
      key: string;
      date: string;
      comment: CompleteCommentProps;
      group: CompleteCommentProps[];
      groupIndex: number;
      unread: boolean;
    };
const LOAD_EDGE_PX = 700;
export default function CommentArea() {
  const { data: taskMembers, isLoading: taskMembersLoading } =
    useAllTaskUsers();
  const {
    comments,
    jumpToComments,
    isLoading,
    loadingTop,
    loadingBottom,
    markAsRead,
    markAllRead,
    fetchNewer,
    fetchOlder,
    hasNewer,
    hasOlder,
    showCachedLatest,
  } = useComments();
  const context = useTaskCommentView();
  const { id: taskId } = useCurrentTask();
  const sortedGroupedComments = useMemo(
    () => getSortedGroupedComments(comments),
    [comments],
  );
  const unreadComments = useMemo(
    () =>
      sortedGroupedComments.flatMap(
        ([, dayComments]: [unknown, CompleteCommentProps[]]) =>
          dayComments.filter(
            (comment: CompleteCommentProps) => !comment.isReadByMe,
          ),
      ),
    [sortedGroupedComments],
  );
  const firstUnreadId = unreadComments[0]?.id;
  const [unreadBarAnchorId, setUnreadBarAnchorId] = useState<string | null>(
    null,
  );
  const isDeletingRef = useRef(false);
  const [unreadBarDisabled, setUnreadBarDisabled] = useState(false);
  const { data: mentions, isLoading: isLoadingMentions } = useCommentMentions();
  const [reply, setReply] = useState<commentReplyProps | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToFirstUnreadRef = useRef(false);
  const [pendingJumpId, setPendingJumpId] = useState<string | null>(null);
  const olderFetchArmed = useRef(true);
  const newerFetchArmed = useRef(true);
  const olderScrollAnchor = useRef<{
    commentId: string;
    offset: number;
    rowCount: number;
  } | null>(null);
  useEffect(() => {
    setUnreadBarAnchorId(null);
    setUnreadBarDisabled(false);
  }, [taskId]);

  useEffect(() => {
    if (!unreadBarAnchorId && firstUnreadId) {
      setUnreadBarAnchorId(firstUnreadId);
    }
  }, [firstUnreadId, unreadBarAnchorId]);
  const rows = useMemo<CommentRow[]>(() => {
    const result: CommentRow[] = [];

    for (const [date, dayComment] of sortedGroupedComments) {
      result.push({ type: "date", key: `date:${date}`, date });

      dayComment.forEach((comment, groupIndex) => {
        if (
          !unreadBarDisabled &&
          unreadBarAnchorId &&
          comment.id === unreadBarAnchorId
        ) {
          result.push({
            type: "unread",
            key: `unread:${date}`,
            date,
          });
        }

        result.push({
          type: "comment",
          key: `comment:${comment.id}`,
          date,
          comment,
          group: dayComment,
          groupIndex,
          unread: !comment.isReadByMe,
        });
      });
    }
    return result;
  }, [sortedGroupedComments, unreadBarAnchorId, unreadBarDisabled]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => chatContainerRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      if (row?.type === "date") return 44;
      if (row?.type === "unread") return 36;
      return 96; // estimate only; the rendered comment is measured
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

  useEffect(() => {
    hasScrolledToFirstUnreadRef.current = false;
  }, [taskId]);

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
  const didInitialScroll = useRef(false);
  useLayoutEffect(() => {
    didInitialScroll.current = false;
    setReady(false);
    setPendingJumpId(null);
    olderFetchArmed.current = true;
    newerFetchArmed.current = true;
  }, [taskId]);
  useLayoutEffect(() => {
    if (firstUnreadId && unreadBarAnchorId !== firstUnreadId) return;
    if (didInitialScroll.current || isLoading || rows.length === 0) return;

    didInitialScroll.current = true;

    const unreadIndex = unreadBarAnchorId
      ? rows.findIndex(
          (row: CommentRow) =>
            row.type === "unread" &&
            row.date ===
              rows.find(
                (candidate: CommentRow) =>
                  candidate.type === "comment" &&
                  candidate.comment.id === unreadBarAnchorId,
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
        const firstVisibleComment = virtualItems.find((item: VirtualItem) => {
          const row = rows[item.index];
          return row?.type === "comment" && item.end > offset;
        });

        const anchorRow = firstVisibleComment
          ? rows[firstVisibleComment.index]
          : null;

        if (anchorRow?.type === "comment") {
          olderScrollAnchor.current = {
            commentId: anchorRow.comment.id,
            offset: firstVisibleComment!.start - offset,
            rowCount: rows.length,
          };
        }

        olderFetchInFlight.current = true;
        void fetchOlder()
          .catch((error) => {
            console.error("Failed to fetch older comment:", error);
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
            console.error("Failed to fetch newer comment:", error);
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

  const getCommentIndex = useCallback(
    (commentId: string) =>
      rows.findIndex(
        (row: CommentRow) =>
          row.type === "comment" && row.comment.id === commentId,
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

    const index = getCommentIndex(anchor.commentId);
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
  }, [rows, getCommentIndex, virtualizer]);
  const { highlightId, handleScrollTo } = useHandleScrollToComment({
    getCommentIndex,
    scrollToIndex,
  });
  useLayoutEffect(() => {
    if (!pendingJumpId || getCommentIndex(pendingJumpId) < 0) return;

    handleScrollTo(pendingJumpId);
    setPendingJumpId(null);
  }, [pendingJumpId, getCommentIndex, handleScrollTo]);
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
  const jumpToCommentInList = useCallback(
    async (commentId: string) => {
      const comment =
        useCommentStore.getState().tasks[taskId]?.commentsMap[commentId];

      if (comment) {
        handleScrollTo(commentId);
        return;
      }

      setPendingJumpId(commentId);

      try {
        const found = await jumpToComments(commentId);
        if (!found) setPendingJumpId(null);
      } catch (error) {
        setPendingJumpId(null);
        throw error;
      }
    },
    [jumpToComments, taskId, handleScrollTo],
  );

  const { remainingMentions, handleScrollToLatestMention, showMention } =
    useScrollToCommentMention(mentions ?? [], jumpToCommentInList);
  const showScrollButton = rows.length > 0 && !virtualizer.isAtEnd(80);
  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);
  const scrollToBottom = () => {
    virtualizer.scrollToEnd({ behavior: "smooth" });
    setUnreadBarDisabled(true);
  };
  if (isLoading || taskMembersLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full ">
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-6 lg:size-8"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }
  return (
    <div>
      {comments && comments.length > 0 ? (
        <div className=" h-90 relative">
          {pendingJumpId && (
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
            className={`absolute top-2 left-1/2 -translate-x-1/2 bg-gray-800  text-white text-xs px-3 py-1 rounded-full shadow transition-all duration-300 pointer-events-none ${
              showDate ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
            aria-hidden
          >
            {currentDate &&
              CommentsDateIndicatorFormatter(new Date(currentDate))}
          </div>

          <div
            ref={chatContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden thinScrollbar"
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
                               text-xs px-3 py-1 ml-4 rounded-full shadow my-2 ${
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

                    {row.type === "comment" && (
                      <div>
                        <CommentChatBubble
                          comment={row.comment}
                          handleScrollTo={handleScrollTo}
                          highlightId={highlightId}
                          setReply={setReply}
                          {...(row.unread ? { markAsRead } : {})}
                          chatContainerRef={chatContainerRef}
                          jumpToComment={jumpToCommentInList}
                          isDeletingRef={isDeletingRef}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {loadingBottom && (
              <div className="my-1 flex items-center justify-center ">
                <Spinner1 size="size-4" />
              </div>
            )}
          </div>
          <div className="absolute bottom-3 right-4 flex flex-col items-center gap-2">
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
                  pendingBottomScroll.current = true;
                  setUnreadBarDisabled(true);

                  showCachedLatest();

                  void markAllRead();
                }}
                className={` cursor-pointer  bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
                  showScrollButton
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75 pointer-events-none"
                }`}
              >
                <DownArrow size={"size-4 lg:size-5"}></DownArrow>
                {unreadComments.length > 0 && (
                  <div className="absolute bottom-7 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
                    <div className="transition-opacity duration-150">
                      {unreadComments.length}
                    </div>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="h-90 flex items-center justify-center text-sm md:text-lg text-gray-700 dark:text-gray-300 ">
          {isLoading || isLoadingMentions ? (
            <div className="absolute inset-0 flex items-center justify-center z-100">
              <div className="bg-white/10 backdrop-blur-xl rounded-full lg:p-2 p-1">
                <Spinner1 size="size-5 lg:size-6" />
              </div>
            </div>
          ) : (
            <div className="bg-gray-300/30 dark:bg-gray-500/30 text-gray-700 dark:text-gray-300 px-3 py-0.5 rounded-full w-fit shadow-sm">
              No comments yet
            </div>
          )}
        </div>
      )}
      <div>
        <InputEditor
          users={taskMembers?.members ?? []}
          reply={reply}
          setReply={setReply}
          scrollToBottom={scrollToBottom}
        />
      </div>
    </div>
  );
}
