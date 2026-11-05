import { commentReactionProps, CompleteChatProps } from "@/app/interfaces";
import customColorFromName from "@/lib/functions/colors/customColorFromName";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useOpenUser } from "@/lib/stateMangement/useOpenUser";
import { format } from "date-fns";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
import GetReplyMsg from "../bubble/GetReplyMsg";
import { PinSvg } from "@/components/svg/PinSvg";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { BubbleMedia } from "../bubble/media/BubbleMedia";
import { useMediaStore } from "@/lib/hooks/zustand/useMediaStore";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";

export default function ChatPinBubble({
  chat,
  jumpToMsg,
  setShowDrop,
  type,
}: {
  chat: CompleteChatProps;
  jumpToMsg: (target: string) => void;
  setShowDrop: Dispatch<SetStateAction<boolean>>;
  type: string;
}) {
  const { setShowUserId } = useOpenUser();
  const { id: currentUserId } = useCurrentUser();
  const { id: conversationId } = useCurrentConversation();
  const { id: workspaceId } = useCurrentWorkspace();
  const isUser = currentUserId === chat.user.id;
  const parsedHtml = useMemo(
    () => ({
      __html: getSafeHtml(chat.message),
    }),
    [chat.message],
  );
  const handleMentionClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute("data-id");

    if (id) {
      setShowUserId(id);
    }
  };
  const { ensureSignedUrls } = useMediaStore();
  const refreshSignedUrls = useCallback(
    () => ensureSignedUrls(chat.media, workspaceId, conversationId, chat.id),
    [chat, workspaceId, conversationId, ensureSignedUrls],
  );
  useEffect(() => {
    void refreshSignedUrls();
  }, [refreshSignedUrls]);
  return (
    <div
      className={`group flex gap-2 p-1 md:p-2 rounded-md transition-all duration-300 ${
        isUser ? " justify-end " : ""
      }`}
      id={`pinned-${chat.id}`}
    >
      {isUser && (
        <div
          className="flex items-end ml-2 "
          onClick={() => {
            jumpToMsg(chat.id);
            setShowDrop(false);
          }}
        >
          <div className="relative bg-gray-400 dark:bg-blk6 px-1 py-1 rounded-full cursor-pointer transform scale-x-[-1]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 text-white dark:text-gray-200"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute top-1.5 left-2 dark:text-blk6 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-1`}>
        {type === "group" && !isUser && (
          <div className={`mt-1`}>
            {chat.user.avatar ? (
              <div
                className="relative w-6 h-6  rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                onClick={() => {}}
              >
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
      </div>
      <div className="flex flex-col gap-1">
        {type === "group" && !isUser && (
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
          <div
            className={`transfrom duration-300 max-w-68 rounded-xl shadow-md  p-3  text-xs md:text-sm  break-words overflow-wrap-anywhere ${
              isUser
                ? "bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-100 rounded-tr-none"
                : "bg-gray-200 dark:bg-blk5  text-gray-600 dark:text-gray-300 rounded-tl-none"
            } `}
          >
            {chat.replyTo && (
              <div
                className={`${
                  isUser
                    ? "bg-blue-200 dark:bg-blue-300/50"
                    : "dark:bg-blk9 bg-gray-100"
                } rounded-lg border-l-4 border-2 px-1 py-0.5 cursor-pointer shadow-sm hover:shadow-lg ${customColorFromName(
                  chat.replyTo.messagedBy.name,
                  "border",
                )} min-w-30  `}
                onClick={() => {
                  jumpToMsg(chat.replyTo!.chatId);
                  setShowDrop(false);
                }}
              >
                <GetReplyMsg reply={chat.replyTo} />
              </div>
            )}
            <BubbleMedia
              chat={chat}
              isUser={chat.user.id === currentUserId}
              refreshSignedUrls={refreshSignedUrls}
            />
            {chat.message && (
              <span
                className="prose dark:prose-invert inline"
                onClick={handleMentionClick}
                dangerouslySetInnerHTML={parsedHtml}
              />
            )}
            {!chat.reactions && (
              <span
                className={` text-[10px]  inline-block ml-2 align-bottom float-right clear-right mt-2 ${
                  isUser ? "text-gray-600 dark:text-blue-300" : "text-gray-500"
                }`}
              >
                <div className="flex gap-2 items-center">
                  {chat.isPinned && (
                    <span className="  lg:pr-2 pr-1">
                      <PinSvg size="size-3" />
                    </span>
                  )}
                  {chat.editedAt && "edited"}{" "}
                  {format(chat.deliveredAt || chat.createdAt, "hh:mm a")}
                  <div className="flex-shrink-0">
                    {chat.deliveredAt ? (
                      <div
                        className={`${
                          chat.seenAt ? "text-blue-500" : "text-gray-500"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-check2-all"
                          viewBox="0 0 16 16"
                        >
                          <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                          <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                        </svg>
                      </div>
                    ) : chat.sentAt ? (
                      <div className="text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-check2"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                        </svg>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </span>
            )}
            {chat.reactions && (
              <div className="flex items-center flex-wrap gap-1 max-w-60">
                {chat.reactions.map((r: commentReactionProps, idx: number) => (
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
            {chat.reactions && chat.reactions.length > 0 && (
              <span
                className={` text-[10px] flex justify-end gap-1 w-full items-center ${
                  isUser ? "text-gray-600 dark:text-blue-300" : "text-gray-500"
                }`}
              >
                {chat.isPinned && (
                  <span className="  lg:pr-2 pr-1">
                    <PinSvg size="size-3" />
                  </span>
                )}
                {chat.editedAt && "edited"}
                {format(chat.deliveredAt || chat.createdAt, "hh:mm a")}
                <div className="flex-shrink-0">
                  {chat.deliveredAt ? (
                    <div
                      className={`${
                        chat.seenAt
                          ? isUser
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-check2-all"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                        <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                      </svg>
                    </div>
                  ) : chat.sentAt ? (
                    <div className="text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-check2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </span>
            )}
          </div>
        </div>
      </div>
      {!isUser && (
        <div
          className="flex items-end ml-2 "
          onClick={() => {
            jumpToMsg(chat.id);
            setShowDrop(false);
          }}
        >
          <div className="relative bg-gray-400 dark:bg-blk6 px-1 py-1 rounded-full cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 text-white dark:text-gray-200"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute top-1.5 left-2 dark:text-blk6 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
