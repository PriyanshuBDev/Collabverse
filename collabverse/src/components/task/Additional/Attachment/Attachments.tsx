import { attachmentProps } from "@/app/interfaces";
import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import AttachmentCard from "./AttachmentCard";
import Spinner1 from "@/components/loadings/Spinner1";

export default function Attachments({
  attachments,
  loadMoreRef,
  isFetchingNextPage,
}: {
  attachments: attachmentProps[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}) {
  const [showAttaDetails, setShowAttaDetails] = useState<string[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [showDate, setShowDate] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const attachmentContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserNearBottomRef = useRef(true);
  const isAutoScrollingRef = useRef(false);
  const imagesPendingRef = useRef(0);
  const prevCountRef = useRef(attachments.length);
  const hasInitialScrollRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const groupedAttachmentByDate = attachments.reduce<
    Record<string, attachmentProps[]>
  >((acc, attachment) => {
    const date = new Date(attachment.createdAt).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(attachment);
    return acc;
  }, {});

  const sortedGroupedAttachments = Object.entries(groupedAttachmentByDate).sort(
    ([a]: [string, attachmentProps[]], [b]: [string, attachmentProps[]]) =>
      new Date(a).getTime() - new Date(b).getTime(),
  );
  function scrollToBottom({ smooth = true } = {}) {
    const container = attachmentContainerRef.current;
    if (!container) return;
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    isAutoScrollingRef.current = true;
    container.scrollTo({
      top: maxScrollTop > 0 ? maxScrollTop : 0,
      behavior: smooth ? "smooth" : "auto",
    });
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 400);
  }

  const updateCurrentDateFromScroll = () => {
    const container = attachmentContainerRef.current;
    if (!container) return;
    const dateEls = Array.from(
      container.querySelectorAll<HTMLElement>("[id^='date-']"),
    );
    if (dateEls.length === 0) {
      setCurrentDate(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const anchorY = containerRect.top + 8;
    let activeDate: string | null = null;
    for (const el of dateEls) {
      const r = el.getBoundingClientRect();
      if (r.top <= anchorY) activeDate = el.id.replace("date-", "");
      else break;
    }
    if (!activeDate) {
      const firstVisible = dateEls.find((el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.top < containerRect.bottom && r.bottom > containerRect.top;
      });
      activeDate = firstVisible ? firstVisible.id.replace("date-", "") : null;
    }
    setCurrentDate((prev) => (prev === activeDate ? prev : activeDate));
  };

  const handleScroll = () => {
    if (isAutoScrollingRef.current) return;
    if (!showDate) setShowDate(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setShowDate(false), 1200);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateCurrentDateFromScroll());
  };

  // Scroll tracking
  useEffect(() => {
    const c = attachmentContainerRef.current;
    if (!c) return;
    const onScroll = () => {
      const nearBottom =
        Math.abs(c.scrollHeight - c.scrollTop - c.clientHeight) < 10;
      isUserNearBottomRef.current = nearBottom;
      setShowScrollButton(!nearBottom);
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => c.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Initial render scroll to bottom once
  useEffect(() => {
    const c = attachmentContainerRef.current;
    if (c && !hasInitialScrollRef.current) {
      requestAnimationFrame(() => scrollToBottom({ smooth: false }));
      hasInitialScrollRef.current = true;
    }
  }, []);

  // ✅ Only auto-scroll when new attachments appear and user is near bottom
  useLayoutEffect(() => {
    if (
      attachments.length > prevCountRef.current &&
      isUserNearBottomRef.current
    ) {
      requestAnimationFrame(() => scrollToBottom({ smooth: false }));
    }
    prevCountRef.current = attachments.length;
  }, [attachments]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      imagesPendingRef.current = 0;
    };
  }, []);

  if (!groupedAttachmentByDate) {
    return (
      <div className="h-80 flex items-center justify-center text-sm md:text-lg text-gray-700 dark:text-gray-300">
        No Attachments Yet
      </div>
    );
  }
  return (
    <div className=" h-full relative pb-3">
      {/* Floating date indicator */}
      <div
        className={`absolute top-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow transition-all duration-300 pointer-events-none ${
          showDate ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
        aria-hidden
      >
        {currentDate && CommentsDateIndicatorFormatter(new Date(currentDate))}
      </div>

      {/* Scroll container */}
      <div
        ref={attachmentContainerRef}
        className="max-h-117  overflow-y-auto thinScrollbar"
        onScroll={handleScroll}
      >
        {" "}
        {isFetchingNextPage && (
          <div className="my-1 flex items-center justify-center ">
            <Spinner1 size="size-4" />
          </div>
        )}
        <div ref={loadMoreRef} />
        {sortedGroupedAttachments.map(
          ([date, attachments]: [string, attachmentProps[]]) => (
            <div key={date}>
              <div id={`date-${date}`} className="flex justify-center">
                <div className="bg-gray-300 dark:bg-blk7 text-gray-700 dark:text-gray-200 text-xs px-3 py-1 rounded-full shadow my-2">
                  {CommentsDateIndicatorFormatter(new Date(date))}
                </div>
              </div>
              {attachments.map((a: attachmentProps, idx: number) => (
                <AttachmentCard
                  key={idx}
                  attachment={a}
                  show={showAttaDetails}
                  setShow={setShowAttaDetails}
                />
              ))}
            </div>
          ),
        )}
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom({ smooth: true })}
          className={`z-100  cursor-pointer absolute bottom-3 right-4 bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk6 dark:hover:bg-blk9 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
            showScrollButton
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 lg:size-5"
          >
            <path
              fillRule="evenodd"
              d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
