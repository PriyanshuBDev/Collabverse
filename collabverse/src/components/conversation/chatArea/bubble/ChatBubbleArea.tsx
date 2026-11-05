"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  chatReplyProps,
  CompleteChatProps,
  selectedMsgsProps,
  convoDetailsProps,
  commentReactionProps,
} from "../../../../app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EmojiPicker } from "frimousse";
import {
  useFloating,
  offset,
  shift,
  flip,
  autoUpdate,
} from "@floating-ui/react";
import ChatBubble from "./ChatBubble";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import useIsDark from "@/lib/hooks/useIsDark";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { GroupPerm } from "@prisma/client";
import { replyBuilder } from "@/lib/functions/chat/ReplyBuilder";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { bubbleShape, selectMsgUserProps } from "../mainArea/ChatArea";
import { useReactions } from "@/lib/queries/workspace/conversation/messages/useReactions";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

interface props {
  chat: CompleteChatProps;
  jumpToMsg: (messageId: string) => void;
  highlightId?: string | null;
  setReply: Dispatch<SetStateAction<chatReplyProps | null>>;
  markAsRead?: (chatId: string) => void;
  chatContainerRef: RefObject<HTMLDivElement | null>;
  setSelectedMsgs: Dispatch<SetStateAction<selectMsgUserProps[]>>;
  selectedMsgs: selectMsgUserProps[];
  isDeletingRef: RefObject<boolean>;
  convoDetails: convoDetailsProps;
  type: string;
  shape: bubbleShape;
  handlePinning: (msgId: string, enabled: boolean) => Promise<void>;
  handleScrollTo: (targetId: string) => void;
}

export default function ChatBubbleArea({
  chat,
  convoDetails,
  jumpToMsg,
  highlightId,
  setReply,
  markAsRead,
  chatContainerRef,
  setSelectedMsgs,
  selectedMsgs,
  isDeletingRef,
  type,
  shape,
  handlePinning,
  handleScrollTo,
}: props) {
  const { id: currentUserId } = useCurrentUser();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { mutate } = useReactions();
  const [highlight, setHighlight] = useState(false);
  const setUserId = useShowUserStore.getState().setUserId;
  const isDark = useIsDark();
  const pickerRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLDivElement>(null);
  const userReaction = chat.reactions.find((r: commentReactionProps) =>
    r.reactedBy.includes(currentUserId),
  );
  const [prevReaction, setPrevReactions] = useState<string | undefined>(
    userReaction?.emoji,
  );
  const [localSelected, setLocalSelected] = useState<string | undefined>(
    userReaction?.emoji,
  );
  const readRef = useRef<HTMLDivElement>(null);
  const autoUpdateMemo = useCallback(autoUpdate, []);
  const { refs, floatingStyles } = useFloating({
    placement: currentUserId === chat.user.id ? "left-start" : "right-start", // try right first
    middleware: [
      offset(8), // 8px gap between button and picker
      flip(), // flip left if no space
      shift(), // nudge up/down to stay in viewport
    ],
    whileElementsMounted: showEmojiPicker ? autoUpdateMemo : undefined,
  });

  const [isFlashing, setIsFlashing] = useState(false);
  const flashTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // only trigger if this chat is highlighted
    if (highlightId === chat.id) {
      // clear any existing timeout to restart animation
      if (flashTimeout.current) clearTimeout(flashTimeout.current);

      setIsFlashing(true);

      // auto-remove flash after 1s (or whatever your CSS duration is)
      flashTimeout.current = setTimeout(() => {
        setIsFlashing(false);
      }, 1000);
    }
  }, [highlightId, chat.id]);

  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      emojiBtnRef.current = el;
      refs.setReference(el);
    },
    [refs],
  );
  const setRef2 = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      pickerRef.current = el;
      refs.setFloating(el);
    },
    [refs],
  );
  useEffect(() => {
    if (!readRef.current) return;
    if (!chatContainerRef.current) return;
    if (chat.user.id === currentUserId) return;
    if (chat.isReadByMe) return;
    if (!markAsRead) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          markAsRead(chat.id);
          observer.disconnect();
        }
      },
      {
        root: chatContainerRef.current,
        threshold: 0.5,
      },
    );
    observer.observe(readRef.current);
    return () => observer.disconnect();
  }, [chat, currentUserId, markAsRead, chatContainerRef]);
  useClickOutSide([pickerRef, emojiBtnRef], () => setShowEmojiPicker(false));

  function localSelectUpdater(emoji: string | undefined) {
    setLocalSelected((prev) => {
      const next = prev === emoji ? undefined : emoji;

      // immediately update DOM highlight for instant feedback.
      // Use requestAnimationFrame to wait until any internal click handling has run
      requestAnimationFrame(() => {
        highlightSelectedEmoji(next ?? null);
      });

      return next;
    });
  }
  function handleSingleReaction(emoji: string) {
    mutate(
      {
        reaction: emoji,
        messageId: chat.id,
        allReactions: chat.reactions ?? [],
      },
      {
        onError: () => {
          localSelectUpdater(prevReaction);
        },
        onSuccess: () => {
          setPrevReactions(localSelected);
        },
      },
    );
    setShowEmojiPicker(false);
  }
  const highlightStyle = `
  .frimousse-picker .selected-emoji {
    background-color: rgb(59 130 246 / 0.35) !important;
    border-radius: 0.5rem;
    transition: background-color 120ms ease;
  }
`;

  // helper that adds/removes the class
  function highlightSelectedEmoji(selected: string | null) {
    // query picker buttons
    const pickerRoot = pickerRef.current?.querySelectorAll("button");
    if (!pickerRoot) return;
    pickerRoot.forEach((btn) => {
      const el = btn as HTMLElement;
      // Frimousse button label may include extra nodes—use textContent and trim
      const text = (el.textContent || "").trim();
      if (!selected) {
        el.classList.remove("selected-emoji");
      } else if (text === selected) {
        el.classList.add("selected-emoji");
      } else {
        el.classList.remove("selected-emoji");
      }
    });
  }

  // effect: reapply highlight when picker opens or selected changes
  useEffect(() => {
    if (!showEmojiPicker || !pickerRef.current) return;

    // initial highlight after the DOM paints
    const raf = requestAnimationFrame(() => {
      highlightSelectedEmoji(localSelected ?? null);
    });

    // attach observer to the floating root (stable)
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() =>
        highlightSelectedEmoji(localSelected ?? null),
      );
    });

    observer.observe(pickerRef.current, {
      childList: true,
      subtree: true,
    });

    // also re-apply on scroll inside viewport
    const viewport = pickerRef.current.querySelector("[frimousse-viewport]");
    const handleScroll = () => {
      requestAnimationFrame(() =>
        highlightSelectedEmoji(localSelected ?? null),
      );
    };

    viewport?.addEventListener("scroll", handleScroll);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      viewport?.removeEventListener("scroll", handleScroll);
    };
  }, [showEmojiPicker, localSelected]);

  // Updated onEmojiSelect handler — call setLocalSelected with functional update so we get latest
  function onSelectEmojiHandler(emoji: string) {
    // toggle localSelected (use function to avoid stale closure)
    localSelectUpdater(emoji);
    // run your reaction updating logic
    handleSingleReaction(emoji);

    // optionally close picker
    // setShowEmojiPicker(false);
  }
  const selectedMap = useMemo(() => {
    return new Map(selectedMsgs.map((s: selectedMsgsProps) => [s.msgId, s]));
  }, [selectedMsgs]);
  useEffect(() => {
    if (!selectedMsgs) return;
    if (selectedMap.has(chat.id)) {
      setHighlight(true);
    } else {
      setHighlight(false);
    }
  }, [selectedMsgs, chat.id, selectedMap]);
  const deleted = chat.isDeleted || chat.isDeletedForUser;

  const handleSelect = (e: React.MouseEvent) => {
    if (deleted) return;
    if (selectedMsgs && selectedMsgs?.length > 0) {
      if (!setSelectedMsgs) return;
      e.preventDefault();
      if (selectedMap.has(chat.id)) {
        setSelectedMsgs((prev) =>
          prev.filter((s: selectedMsgsProps) => s.msgId !== chat.id),
        );
        setHighlight(false);
      } else {
        if (selectedMsgs.length >= 50) return;
        setSelectedMsgs((prev) => [
          ...(prev ?? []),
          { msgId: chat.id, userId: chat.user.id },
        ]);
      }
    }
  };

  const isUser = currentUserId === chat.user.id;
  const groupPerm = (perm: GroupPerm) => {
    return type === "Dm"
      ? true
      : convoDetails.header.permissions
        ? convoDetails.header.permissions.includes(perm)
        : false;
  };
  const canPin = groupPerm("Pin");
  const pinLimitReached = convoDetails.pins.length > 21;
  return (
    <div
      ref={readRef}
      className={`group flex gap-2 px-2 py-1 rounded-md transition-all duration-300 ${
        selectedMsgs && selectedMsgs.length > 0 ? "no-pointer-children " : ""
      } ${isFlashing ? "flash-highlight " : ""} ${
        highlight ? "bg-blue-500/40" : ""
      } ${isUser ? " justify-end" : ""} ${
        type === "group" && !isUser && !shape.first ? "pl-10" : ""
      } ${shape.last ? "mb-2" : ""}`}
      id={`message-${chat.id}`}
      data-message-id={chat.id}
      onContextMenu={handleSelect}
    >
      {type === "group" && !isUser && shape.first && (
        <div
          className={`mt-1`}
          onClick={() => {
            if (chat.user.id !== currentUserId && chat.user.id) {
              setUserId(chat.user.id);
            }
          }}
        >
          {chat.user.avatar ? (
            <div className="relative w-6 h-6  rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
              <Image
                alt={"UserAvatar"}
                src={chat.user.avatar}
                className="object-center"
                fill
              ></Image>
            </div>
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex justify-center items-center cursor-pointer `}
              style={{ background: gradientBgFromName(chat.user.name) }}
              onClick={() => {}}
            >
              <div className="font-semibold text-xs text-white">
                {getInitials(chat.user.name)}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {type === "group" && !isUser && shape.first && (
          <div className="flex items-center gap-2">
            <div
              className="text-gray-800 dark:text-gray-200 text-sm md:text-base font-semibold hover:underline cursor-pointer"
              onClick={() => {}}
            >
              {chat.user.name}
            </div>
          </div>
        )}

        <div className="flex gap-1">
          {!deleted && isUser && (
            <div className="relative flex items-center">
              <div
                className={`flex items-center justify-start opacity-0 transition-all duration-300 ${
                  selectedMsgs && selectedMsgs.length > 0
                    ? ""
                    : "group-hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-0.5 relative">
                  <div
                    className={`bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-200 cursor-pointer text-xs md:text-base  flex items-center gap-1  p-1 rounded-full w-6 overflow-hidden hover:w-15 transition-all duration-300  `}
                    onClick={() => {
                      setReply(replyBuilder(chat));
                    }}
                  >
                    <div className="w-full">
                      {isDark ? (
                        <svg
                          className="w-4 h-4 "
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={`text-xs w-full `}>Reply</div>
                  </div>
                  <div
                    ref={setRef}
                    className={`cursor-pointer text-xs md:text-base  flex items-center gap-1  p-1 rounded-full w-6 overflow-hidden hover:w-15 transition-all duration-300 ${
                      isUser
                        ? "bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-200"
                        : "bg-gray-200 dark:bg-blk5  text-gray-600"
                    }`}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <div className="w-full">
                      {isDark ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={`text-xs w-full `}>Emoji</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ChatBubble
            chat={chat}
            jumpToMsg={jumpToMsg}
            setSelectedMsgs={setSelectedMsgs}
            setReply={setReply}
            isDeletingRef={isDeletingRef}
            shape={shape}
            isUser={isUser}
            canPin={canPin}
            handlePinning={handlePinning}
            pinLimitReached={pinLimitReached}
            handleScrollTo={handleScrollTo}
            convo={convoDetails}
          />
          {!deleted && selectedMsgs && selectedMsgs.length > 0 && (
            <div className="flex items-end ml-2">
              {highlight ? (
                <svg
                  className="w-5 h-5 text-green-500 bg-white rounded-full"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-5 h-5 border-2 rounded-full border-gray-600 dark:border-gray-400" />
              )}
            </div>
          )}

          {!deleted && !isUser && (
            <div className="relative flex items-center">
              <div
                className={`flex items-center justify-start opacity-0 transition-all duration-300 ${
                  selectedMsgs && selectedMsgs.length > 0
                    ? ""
                    : "group-hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-0.5 relative">
                  <div
                    className="cursor-pointer text-xs md:text-base text-gray-500 flex items-center gap-1 bg-gray-200 dark:bg-blk5 p-1 rounded-full w-6 overflow-hidden hover:w-15 transition-all duration-300"
                    onClick={() => setReply(replyBuilder(chat))}
                  >
                    <div className="w-full">
                      {isDark ? (
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={`text-xs w-full `}>Reply</div>
                  </div>
                  <div
                    ref={setRef}
                    className={`cursor-pointer text-xs md:text-base text-gray-500 flex items-center gap-1 bg-gray-200 dark:bg-blk5 p-1 rounded-full w-6 overflow-hidden hover:w-15 transition-all duration-300 `}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <div className="w-full">
                      {isDark ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={`text-xs w-full `}>Emoji</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {createPortal(
            <>
              {showEmojiPicker && (
                <div
                  className="fixed inset-0 z-[998]"
                  style={{ pointerEvents: "auto" }}
                  onClick={() => setShowEmojiPicker(false)} // click anywhere closes menu
                />
              )}
              <div
                ref={setRef2}
                // ensure fixed so it's positioned relative to viewport when portalled
                style={{ ...floatingStyles, position: "fixed" }}
                className={`z-999  rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-blk3 text-gray-900 dark:text-gray-100 shadow-lg p-2 transition-opacity duration-200 ${
                  showEmojiPicker
                    ? "opacity-100 visible pointer-events-auto"
                    : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <style>{highlightStyle}</style>

                <EmojiPicker.Root
                  className="frimousse-picker"
                  onEmojiSelect={({ emoji }) => onSelectEmojiHandler(emoji)}
                >
                  <EmojiPicker.Search className="w-full p-1 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-blk7 text-sm outline-none" />

                  <EmojiPicker.Viewport className="max-h-45 overflow-y-auto mt-2 custom-scrollbar">
                    <style jsx global>{`
                      .frimousse-picker * {
                        cursor: pointer !important;
                      }
                    `}</style>

                    <style>{`
                        ${highlightStyle}
                        [frimousse-category-header] { pointer-events: none !important; }
                    `}</style>
                    <EmojiPicker.List className="custom-emoji-grid gap-1 text-base [&_button]:rounded-md [&_button]:p-1" />
                  </EmojiPicker.Viewport>
                </EmojiPicker.Root>
              </div>
            </>,
            document.body,
          )}
        </div>
      </div>
    </div>
  );
}
