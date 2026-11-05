"use client";

import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  commentReactionProps,
  chatReplyProps,
  CompleteChatProps,
  convoDetailsProps,
  chatMediaProps,
} from "../../../../app/interfaces";
import htmlToText from "@/lib/functions/chat/htmlToText";
import customColorFromName from "@/lib/functions/colors/customColorFromName";
import { createPortal } from "react-dom";
import { format, isValid } from "date-fns";
import DownloadListBtn from "@/components/btns/download/DownloadListBtn";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import Forward from "../forward/Forward";
import ChatDeleting from "@/components/warnings/ChatDeleting";
import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
import GetReplyMsg from "./GetReplyMsg";
import { replyBuilder } from "@/lib/functions/chat/ReplyBuilder";
import { handleContextMenu } from "@/lib/functions/chat/handleContextMenu";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { PinSvg } from "@/components/svg/PinSvg";
import { signedUrl, useMediaStore } from "@/lib/hooks/zustand/useMediaStore";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { BubbleMedia } from "./media/BubbleMedia";
import { bubbleShape, selectMsgUserProps } from "../mainArea/ChatArea";
import PinLimitReachedWarning from "@/components/warnings/PinLimitReachedWarning";
import { DoubleTickSvg, SingleTickSvg } from "@/components/svg/TickSvg";
import { ClockSvgLight } from "@/components/svg/ClockSvg";
import { useDeleteMessages } from "@/lib/queries/workspace/conversation/messages/useDeleteMessages";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { OutgoingArrowSvg } from "@/components/svg/OutgoingArrowSvg";
import { IncomingArrowSvg } from "@/components/svg/IncomingArrowSvg";
import { formatDuration } from "@/lib/hooks/useDuration";
import { VideoCallDarkSvg } from "@/components/svg/VideoCallSvg";
import { VoiceCallDarkSvg } from "@/components/svg/VoiceCallSvg";
import { useCallContext } from "@/components/wrappers/CallProvider";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export interface PositionProps {
  x: number;
  y: number;
}

interface Props {
  chat: CompleteChatProps;
  jumpToMsg: (targetId: string) => void;
  setSelectedMsgs?: Dispatch<SetStateAction<selectMsgUserProps[]>>;
  setReply: Dispatch<SetStateAction<chatReplyProps | null>>;
  isDeletingRef?: RefObject<boolean>;
  setPins?: Dispatch<SetStateAction<CompleteChatProps[]>>;
  pins?: CompleteChatProps[];
  isUser: boolean;
  shape: bubbleShape;
  canPin: boolean;
  handlePinning: (msgId: string, enabled: boolean) => Promise<void>;
  pinLimitReached: boolean;
  handleScrollTo: (targetId: string) => void;
  convo: convoDetailsProps;
}
export default function ChatBubble({
  chat,
  jumpToMsg,
  setSelectedMsgs,
  setReply,
  isDeletingRef,
  isUser,
  shape,
  canPin,
  handlePinning,
  pinLimitReached,
  handleScrollTo,
  convo,
}: Props) {
  const { startCall } = useCallContext();
  const { id: currentUserId } = useCurrentUser();
  const { id: conversationId, type } = useCurrentConversation();
  const { id: workspaceId } = useCurrentWorkspace();
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showPinLimitReached, setShowPinLimitReached] = useState(false);
  const { setUserId } = useShowUserStore();
  const [showForward, setShowForward] = useState(false);
  const { mutate } = useDeleteMessages();
  useClickOutSide([menuRef], () => setMenuPos(null));
  const ensureSignedUrls = useMediaStore((s) => s.ensureSignedUrls);
  const mediaPaths = useMediaStore((s) => s.urls[chat.id]?.paths);
  const mediaUrls = useMemo(
    () => Object.values(mediaPaths ?? {}).map((path: signedUrl) => path.url),
    [mediaPaths],
  );
  function positionMenu(
    clickX: number,
    clickY: number,
    menuW: number,
    menuH: number,
  ) {
    let x = clickX;
    let y = clickY;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    if (x + menuW > viewportW) {
      x -= menuW;
    }

    if (y + menuH > viewportH) {
      y -= menuH;
    }

    x = Math.max(0, Math.min(x, viewportW - menuW));
    y = Math.max(0, Math.min(y, viewportH - menuH));
    return { x, y };
  }

  useEffect(() => {
    if (!menuPos || !menuRef.current) return;
    const menuW = menuRef.current.offsetWidth;
    const menuH = menuRef.current.offsetHeight;

    const { x, y } = positionMenu(menuPos.x, menuPos.y, menuW, menuH);
    if (x !== menuPos.x || y !== menuPos.y) setMenuPos({ x, y });
  }, [menuPos]);
  const refreshSignedUrls = useCallback(
    () => ensureSignedUrls(chat.media, workspaceId, conversationId, chat.id),
    [chat.media, chat.id, workspaceId, conversationId, ensureSignedUrls],
  );
  useEffect(() => {
    void refreshSignedUrls();
  }, [refreshSignedUrls]);
  const mediaPathKey = chat.media
    .map((item: chatMediaProps) => item.path ?? "")
    .filter(Boolean)
    .join("|");

  useEffect(() => {
    if (!mediaPathKey) return;
    void ensureSignedUrls(chat.media, workspaceId, conversationId, chat.id);
  }, [
    mediaPathKey,
    chat.id,
    workspaceId,
    conversationId,
    ensureSignedUrls,
    chat.media,
  ]);
  const parsedHtml = useMemo(
    () => ({
      __html: getSafeHtml(chat.message) ?? <></>,
    }),
    [chat.message],
  );
  const closeMenu = () => {
    setMenuPos(null);
  };
  const handleSelect = () => {
    if (!setSelectedMsgs) return;
    setSelectedMsgs((prev) => [
      ...(prev ?? []),
      { msgId: chat.id, userId: chat.user.id },
    ]);
    closeMenu();
  };
  const handleDelete = (others: boolean) => {
    if (isDeletingRef !== undefined) {
      isDeletingRef.current = true;
      mutate({ msgs: [{ msgId: chat.id }], others });
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 200);
    }
  };
  const handleMentionClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute("data-id");

    if (id) {
      setUserId(id);
    }
  };
  const handlePin = () => {
    if (!canPin) return;
    if (pinLimitReached) {
      setShowPinLimitReached(true);
      return;
    }
    handlePinning(chat.id, !chat.isPinned);
    closeMenu();
  };
  const bubbleRounded = isUser
    ? shape.first
      ? shape.last
        ? " rounded-tr-none"
        : "rounded-r-none"
      : shape.middle
        ? " rounded-tr-none rounded-br-none"
        : " rounded-tr-none"
    : shape.first
      ? shape.last
        ? " rounded-tl-none"
        : "rounded-l-none"
      : shape.middle
        ? " rounded-tl-none rounded-bl-none"
        : " rounded-tl-none";

  const getText = () => {
    if (!chat) return;
    if (chat.isDeleted) {
      return chat.user.id === currentUserId
        ? "You deleted this message"
        : "This message was deleted";
    }
    if (chat.isDeletedForUser) {
      return "You deleted this message";
    }
  };
  const deleted = chat.isDeleted || chat.isDeletedForUser;
  const reactions = chat.reactions ?? [];
  const createdAtDate =
    chat.createdAt instanceof Date ? chat.createdAt : new Date(chat.createdAt);

  const timeLabel = isValid(createdAtDate)
    ? format(createdAtDate, "HH:mm")
    : "";
  if (chat.type === "call" && chat.call) {
    return (
      <div
        className={` shadow-md relative transform duration-300 md:max-w-68 max-w-40 rounded-xl  p-2  text-xs md:text-sm  break-words overflow-wrap-anywhere ${
          isUser
            ? "bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-100"
            : "bg-gray-200 dark:bg-blk5  text-gray-600 dark:text-gray-300"
        } `}
        onContextMenu={(e) => handleContextMenu(e, setMenuPos, menuPos)}
        onClick={async () => {
          if (type === "Group") return;
          if (chat.call?.status != "Active" && chat.call?.status != "Calling") {
            const remoteUser = convo.header.members[0];
            if (!remoteUser) return;
            if (!chat.call) return;
            await startCall(
              remoteUser,
              chat.call.type,
              "Workspace",
              conversationId,
            );
          }
        }}
      >
        {deleted ? (
          <span className="italic">{getText()}</span>
        ) : (
          <div
            className={`md:w-[260px] w-36 rounded-lg md:rounded-2xl p-1 lg:p-2  flex items-center justify-between gap-5 ${
              isUser
                ? "bg-blue-400 dark:bg-blue-600/80"
                : "bg-gray-300 dark:bg-blk3"
            }`}
          >
            <div>
              <div className="text-white text-xs md:text-base">
                {chat.call.status === "Ended" ||
                chat.call.status === "Calling" ||
                chat.call.status === "Active"
                  ? isUser
                    ? "Outgoing Call"
                    : "Incoming Call"
                  : chat.call.status}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`${chat.call.status === "Busy" || chat.call.status === "Failed" || chat.call.status === "Missed" || chat.call.status === "Rejected" ? "text-red-500" : chat.call.status === "Cancelled" ? "text-white" : "text-green-500"}`}
                >
                  {isUser ? (
                    <OutgoingArrowSvg size="size-2 lg:size-3" strokeWidth={3} />
                  ) : (
                    <IncomingArrowSvg size="size-2 lg:size-3" strokeWidth={3} />
                  )}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">
                  {timeLabel}{" "}
                  {chat.call.startedAt && chat.call.endedAt
                    ? formatDuration(
                        (new Date(chat.call.endedAt).getTime() -
                          new Date(chat.call.startedAt).getTime()) /
                          1000,
                      )
                    : ""}
                </div>
              </div>
            </div>
            <div>
              {chat.call.type === "Video" ? (
                <VideoCallDarkSvg size="size-4 lg:size-5" />
              ) : (
                <VoiceCallDarkSvg size="size-4 lg:size-5" />
              )}
            </div>
          </div>
        )}
        {!deleted && reactions && (
          <div className="flex items-center flex-wrap gap-1 max-w-60">
            {reactions.map((r: commentReactionProps, idx: number) => (
              <div
                key={idx}
                className="bg-gray-300 dark:bg-blk7 flex items-center gap-1 px-1 py-0.5 rounded-full mt-2 "
              >
                <div className="text-xs">{r.emoji}</div>
                <div className="text-gray-700 dark:text-gray-300 text-xs">
                  {r.reactedBy.length}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={` shadow-md relative transform duration-300 max-w-68 rounded-xl  p-2  text-xs md:text-sm  break-words overflow-wrap-anywhere ${
          isUser
            ? "bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-100"
            : "bg-gray-200 dark:bg-blk5  text-gray-600 dark:text-gray-300"
        } ${bubbleRounded}`}
        onContextMenu={(e) => handleContextMenu(e, setMenuPos, menuPos)}
      >
        {!chat.isDeleted && !chat.isDeletedForUser && chat.replyTo && (
          <div
            className={`${
              isUser
                ? `bg-blue-200 dark:bg-blue-400/30 border-gray-200`
                : `dark:bg-blk9 bg-gray-100 ${customColorFromName(
                    chat.replyTo.messagedBy.name,
                    "border",
                  )}`
            } rounded-lg border-l-4 border-2 px-1 py-0.5 cursor-pointer shadow-sm hover:shadow-lg  min-w-30`}
            onClick={() => {
              const message =
                useChatStore.getState().conversations[conversationId]
                  .messagesMap[chat.replyTo!.chatId!];
              if (message) {
                handleScrollTo(message.id);
              } else {
                jumpToMsg(chat.replyTo!.chatId);
              }
            }}
          >
            <GetReplyMsg reply={chat.replyTo} isUser={isUser} />
          </div>
        )}
        <BubbleMedia
          chat={chat}
          isUser={chat.user.id === currentUserId}
          refreshSignedUrls={refreshSignedUrls}
        />
        {deleted ? (
          <span className="italic">{getText()}</span>
        ) : (
          chat.message && (
            <span
              className="prose dark:prose-invert inline"
              onClick={handleMentionClick}
              dangerouslySetInnerHTML={parsedHtml}
            />
          )
        )}
        {reactions.length <= 0 && (
          <span
            className={` text-[10px]  inline-block ml-2 align-bottom float-right clear-right mt-2 ${
              isUser ? "text-gray-600 dark:text-blue-300" : "text-gray-500"
            }`}
          >
            <div className="flex gap-2 items-center">
              {!deleted && chat.isPinned && (
                <PinSvg size={"size-3 lg:size-4"} />
              )}
              {!deleted && chat.editedAt && "edited"} {timeLabel}
              {isUser && (
                <div className="flex-shrink-0">
                  {chat.isRead ? (
                    <div className={`text-blue-500`}>
                      <DoubleTickSvg size="size-4" />
                    </div>
                  ) : chat.sentAt ? (
                    <div className="text-gray-500">
                      <SingleTickSvg size="size-4" />
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <ClockSvgLight size="size-3" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </span>
        )}
        {!deleted && reactions && (
          <div className="flex items-center flex-wrap gap-1 max-w-60">
            {reactions.map((r: commentReactionProps, idx: number) => (
              <div
                key={idx}
                className="bg-gray-300 dark:bg-blk7 flex items-center gap-1 px-1 py-0.5 rounded-full mt-2 "
              >
                <div className="text-xs">{r.emoji}</div>
                <div className="text-gray-700 dark:text-gray-300 text-xs">
                  {r.reactedBy.length}
                </div>
              </div>
            ))}
          </div>
        )}
        {reactions.length > 0 && (
          <span
            className={` text-[10px] flex justify-end gap-1 w-full items-center ${
              isUser ? "text-gray-600 dark:text-blue-300" : "text-gray-500"
            }`}
          >
            {!deleted && chat.isPinned && (
              <span className="  lg:pr-2 pr-1">
                <PinSvg size={"size-3 lg:size-4"} />
              </span>
            )}
            {!deleted && chat.editedAt && "edited"}
            {timeLabel}
            {isUser && (
              <div className="flex-shrink-0">
                {chat.isRead ? (
                  <div
                    className={`
                      text-blue-600 dark:text-blue-400
                    `}
                  >
                    <DoubleTickSvg size="size-4" />
                  </div>
                ) : chat.sentAt ? (
                  <div className="text-gray-500">
                    <SingleTickSvg size="size-4" />
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <ClockSvgLight size="size-3" />
                  </div>
                )}
              </div>
            )}
          </span>
        )}

        {!deleted &&
          menuPos &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[998]"
                style={{ pointerEvents: "auto" }}
                onClick={() => setMenuPos(null)}
                // click anywhere closes menu
              />
              <div
                ref={menuRef}
                className="fixed bg-gray-300 dark:bg-blk6 shadow-lg rounded-md p-2 w-34 lg:w-44 text-gray-800 dark:text-gray-200 lg:text-base text-sm z-999"
                style={{
                  left: menuPos.x,
                  top: menuPos.y,
                  pointerEvents: "auto",
                }}
              >
                <ul>
                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => {
                      setReply(replyBuilder(chat));
                      closeMenu();
                    }}
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5"
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
                    Reply
                  </li>
                  {canPin && chat.message && (
                    <li
                      className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-3"
                      onClick={handlePin}
                    >
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          fill="currentColor"
                          className="rotate-45"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354m1.58 1.408-.002-.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a5 5 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a5 5 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.8 1.8 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14q.091.15.214.271a1.8 1.8 0 0 0 .37.282" />
                        </svg>

                        {chat.isPinned && (
                          <div className="w-0.5 h-5 rotate-135 bg-gray-800 dark:bg-gray-200 border dark:border-blk3 border-gray-50 rounded absolute -top-1 left-2"></div>
                        )}
                      </div>
                      {chat.isPinned ? "Unpin" : "Pin"}
                    </li>
                  )}
                  {chat.media.length > 0 && (
                    <DownloadListBtn urls={mediaUrls} />
                  )}
                  {chat.message ? (
                    <li
                      className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          htmlToText(chat.message!),
                        );
                        closeMenu();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4 lg:size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                        />
                      </svg>
                      Copy Text
                    </li>
                  ) : (
                    <></>
                  )}
                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => setShowForward(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 lg:size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                      />
                    </svg>
                    Forward
                  </li>
                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => setShowWarning(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 lg:size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    Delete
                  </li>

                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer flex items-center gap-2 rounded-md "
                    onClick={handleSelect}
                    onContextMenu={handleSelect}
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 "
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
                        strokeWidth="2"
                        d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    Select
                  </li>
                </ul>
              </div>
            </>,
            document.body,
          )}
      </div>
      {showForward && (
        <Forward
          showForward={showForward}
          setShowForward={setShowForward}
          selectedMsgs={[{ msgId: chat.id }]}
        />
      )}
      {showPinLimitReached &&
        createPortal(
          <PinLimitReachedWarning
            setShowWarning={setShowPinLimitReached}
            showWarning={showPinLimitReached}
          />,
          document.body,
        )}
      {showWarning &&
        createPortal(
          <ChatDeleting
            setShowWarning={setShowWarning}
            showWarning={showWarning}
            handleDelete={handleDelete}
            otherUserMsgs={chat.user.id !== currentUserId}
          />,
          document.body,
        )}
    </>
  );
}
