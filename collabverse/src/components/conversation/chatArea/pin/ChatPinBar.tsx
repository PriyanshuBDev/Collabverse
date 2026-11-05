import {
  Dispatch,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";
import { chatPinProps, chatPins, convoDetailsProps } from "@/app/interfaces";
import { ChatListType } from "@prisma/client";
import { PinSvg } from "@/components/svg/PinSvg";
import { AdjustmentSvg } from "@/components/svg/AdjustmentSvg";
import { usePinnedMessages } from "@/lib/queries/workspace/conversation/messages/pins/usePinnedMessages";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useIsUserNearBottom } from "@/lib/hooks/conversation/useIsUserNearBottom";
import { scrollToBottomFunction } from "@/lib/functions/chat/scrollToBottom";
import ChatPinMessage from "./ChatPinMessage";
import ChatPinBubble from "./ChatPinBubble";
import UnpinAllWarning from "@/components/warnings/UnpinAllWarning";

export function ChatPinBar({
  convoDetails,
  jumpToMsg,
  type,
  setLoading,
}: {
  convoDetails: convoDetailsProps;
  jumpToMsg: (targetId: string) => void;
  type: ChatListType;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const [pinIndex, setPinIndex] = useState(0);
  const dropContentRef = useRef<HTMLDivElement>(null); // <--- measure height
  const scrollRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");
  const [showDrop, setShowDrop] = useState(false);
  const isUserNearBottomRef = useRef(true);
  const isAutoScrollingRef = useRef(false);
  const prevCountRef = useRef(convoDetails.pins?.length);
  const hasInitialScrollRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showUnpin, setShowUnpin] = useState(false);
  const { data, isError, error, unpinAll } = usePinnedMessages();
  useIsErrorToast(isError, "Failed to fetch pinned messages", error);
  const pinnedMessages = useMemo(() => {
    return data ?? [];
  }, [data]);
  useEffect(() => {
    if (dropContentRef.current) {
      if (showDrop) {
        const scrollHeight = dropContentRef.current.scrollHeight;
        setHeight(Math.min(scrollHeight, 400) + "px"); // expand smoothly
      } else {
        setHeight("0px"); // collapse smoothly
      }
    }
  }, [showDrop]);
  const pins = convoDetails.pins;
  const handlePinLoop = () => {
    const target = pins[pinIndex];
    jumpToMsg(target.messageId);

    if (pinIndex < pins.length - 1) {
      handleScrollingPins(pinIndex + 1);
      setPinIndex(pinIndex + 1);
    } else {
      handleScrollingPins(0);
      setPinIndex(0);
    }
  };
  const handleScrollingPins = (targetIdx: number) => {
    const element = document.getElementById(`pin-${targetIdx}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const groupedPinsByDate = pinnedMessages?.reduce<
    Record<string, chatPinProps[]>
  >((acc, pin) => {
    const date = new Date(pin.sentAt || pin.createdAt)
      .toISOString()
      .split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(pin);
    return acc;
  }, {});

  const sortedGroupedPins = Object.entries(groupedPinsByDate ?? {}).sort(
    ([a]: [string, chatPinProps[]], [b]: [string, chatPinProps[]]) =>
      new Date(a).getTime() - new Date(b).getTime(),
  );
  const scrollToBottom = ({ smooth = true } = {}) =>
    scrollToBottomFunction({
      chatContainerRef: scrollRef,
      isAutoScrollingRef,
      smooth,
    });
  useIsUserNearBottom(scrollRef, isUserNearBottomRef, setShowScrollButton);

  // ---------- initial mount: scroll after images loaded ----------
  // Wait for images in the container to load (prevents layout jump) and then scroll to bottom once.
  useEffect(() => {
    const c = scrollRef.current;
    if (!c || hasInitialScrollRef.current) return;

    const tryScrollAfterImages = () => {
      const imgs = Array.from(c.querySelectorAll<HTMLImageElement>("img"));
      const pending = imgs.filter((i: HTMLImageElement) => !i.complete);
      if (pending.length === 0) {
        // direct scroll
        requestAnimationFrame(() => scrollToBottom({ smooth: false }));
        hasInitialScrollRef.current = true;
        return;
      }

      // attach listeners (once)
      let remaining = pending.length;
      const onDone = () => {
        remaining--;
        if (remaining <= 0) {
          requestAnimationFrame(() => scrollToBottom({ smooth: false }));
          hasInitialScrollRef.current = true;
        }
      };
      pending.forEach((img) => {
        img.addEventListener("load", onDone, { once: true });
        img.addEventListener("error", onDone, { once: true });
      });

      // fallback timeout in case loads take too long
      setTimeout(() => {
        if (!hasInitialScrollRef.current) {
          requestAnimationFrame(() => scrollToBottom({ smooth: false }));
          hasInitialScrollRef.current = true;
        }
      }, 1000);
    };

    // do on next paint
    requestAnimationFrame(tryScrollAfterImages);
  }, []); // run once

  // ---------- preserve scroll / auto-scroll on new comments ----------
  // Only watch comments.length to avoid re-trigger on reference changes.
  useLayoutEffect(() => {
    const c = scrollRef.current;
    if (!c || !pinnedMessages) {
      prevCountRef.current = pinnedMessages?.length ?? 0;
      return;
    }

    const prevCount = prevCountRef.current ?? 0;
    const newCount = pinnedMessages.length;

    // snapshot before DOM update
    const prevScrollTop = c.scrollTop;
    const prevScrollHeight = c.scrollHeight;

    // wait for DOM update (paint)
    requestAnimationFrame(() => {
      const newScrollHeight = c.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeight;

      if (isUserNearBottomRef.current) {
        // if user was at bottom, keep it at bottom
        scrollToBottom({ smooth: false });
      } else if (heightDiff > 0) {
        // user read older messages: maintain relative position
        c.scrollTop = prevScrollTop + heightDiff;
      }

      // if count increased AND user is near bottom, ensure bottom (covers fast adds)
      if (newCount > prevCount && isUserNearBottomRef.current) {
        scrollToBottom({ smooth: false });
      }

      prevCountRef.current = newCount;
    });
  }, [pinnedMessages]);

  return (
    <>
      <div className="shrink-0 h-13  px-5 border-b-2 border-gray-300 dark:border-gray-700  rounded-t-xl flex items-center relative">
        <span className=" text-gray-500 lg:pr-2 pr-1">
          <PinSvg />
        </span>

        <div
          className="overflow-hidden lg:h-12.5 h-11.5 w-full cursor-pointer hover:bg-gray-200 dark:hover:bg-blk4"
          onClick={handlePinLoop}
        >
          {pins.map((p: chatPins, idx: number) => (
            <ChatPinMessage p={p} idx={idx} key={p.id} />
          ))}
        </div>

        <span
          className=" text-gray-500 hover:bg-gray-300 dark:hover:bg-blk6 p-1 rounded-full cursor-pointer"
          onClick={() => {
            setShowDrop((prev) => !prev);
          }}
        >
          <AdjustmentSvg />
        </span>
        <div
          style={{
            maxHeight: height,
            opacity: showDrop ? 1 : 0,
            transform: showDrop
              ? "translateY(0) scale(1)"
              : "translateY(-10px) scale(0.98)",
            transition: "all 0.3s ease",
          }}
          className={`absolute top-13  bg-gray-100 dark:bg-blk3 left-0 right-0 z-2000 shadow-xl rounded-b-lg  border-gray-400 dark:border-gray-700 ${
            showDrop ? "pointer-events-auto" : "pointer-events-none"
          }`}
          ref={dropContentRef}
        >
          <div className="relative">
            <div
              ref={scrollRef}
              className="relative overflow-y-auto max-h-[350px]"
            >
              {sortedGroupedPins.map(
                ([date, pins]: [string, chatPinProps[]]) => (
                  <div key={date}>
                    <div id={`date-${date}`} className="flex justify-center ">
                      <div className="bg-gray-300 dark:bg-blk7 text-gray-700 dark:text-gray-200 text-xs px-3 py-1 ml-4 rounded-full shadow  my-2">
                        {CommentsDateIndicatorFormatter(new Date(date))}
                      </div>
                    </div>
                    {pins.map((pin: chatPinProps) => (
                      <ChatPinBubble
                        type={type}
                        key={pin.id}
                        chat={{ ...pin, isPinned: true }}
                        jumpToMsg={jumpToMsg}
                        setShowDrop={setShowDrop}
                      />
                    ))}
                  </div>
                ),
              )}
            </div>
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom({ smooth: true })}
                className={`absolute bottom-3 right-4 cursor-pointer  bg-gray-300 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-400 rounded-full p-2 shadow-lg transition-all duration-300 ${
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

          <div
            className="text-blue-500 border-t-2 border-gray-300 dark:border-gray-700 flex justify-center lg:text-lg text-sm py-2 hover:bg-gray-300 dark:hover:bg-blk5 rounded-b-xl cursor-pointer"
            onClick={() => {
              setShowDrop(false);
              setShowUnpin((prev) => !prev);
            }}
          >
            Unpin All Messages
          </div>
        </div>
      </div>
      <UnpinAllWarning
        setShow={setShowUnpin}
        show={showUnpin}
        unpin={() => {
          unpinAll.mutate({ setLoading });
        }}
      />
    </>
  );
}
