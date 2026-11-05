import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Xbtn from "../../btns/Xbtn";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import Toolbar from "../../helpers/Toolbar";
import htmlToText from "@/lib/functions/chat/htmlToText";
import muteDateFormatter from "@/lib/functions/date/muteDateFormatter";
import OverlayWrapper from "../../wrappers/OverlayWrapper";
import { useDmUserData } from "@/lib/queries/workspace/conversation/dm/useDmUserData";
import { MuteEnum } from "@prisma/client";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "@/components/loadings/Spinner1";
import { useUserStatus } from "@/lib/hooks/conversation/useUserStatus";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useConversationBroadcast } from "@/lib/hooks/realtime/Conversation/useConversationBroadcast";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { VoiceCallSvg } from "@/components/svg/VoiceCallSvg";
import { VideoCallSvg } from "@/components/svg/VideoCallSvg";
import { useCallContext } from "@/components/wrappers/CallProvider";

export default function DmHeader({
  setIsHeaderLoading,
}: {
  setIsHeaderLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { data, isLoading, isError, error, muteMutation } = useDmUserData();
  const { isOnline, lastSeenAt } = useUserStatus({
    userId: data?.id,
    lastSeenAt: data?.lastSeenAt ?? null,
  });
  const { id: conversationId } = useCurrentConversation();
  const { typingUsers, uploadingUsers } = useConversationBroadcast();
  const [showUser, setShowUser] = useState(false);
  const [showMute, setShowMute] = useState(false);
  const [deleteWarn, setDeleteWarn] = useState(false);
  const [clearWarn, setClearWarn] = useState(false);

  const { startCall } = useCallContext();
  const { active } = useCallStore();
  const ref = useRef<HTMLDivElement>(null);
  const closeUser = () => {
    if (deleteWarn || clearWarn) return;
    setShowUser(false);
  };
  useClickOutSide(ref, closeUser);
  useIsErrorToast(isError, "Failed to fetch user data", error);
  const handleMute = (muteType: MuteEnum) => {
    setShowMute(false);
    muteMutation.mutate({ enabled: true, muteType });
  };
  const handleUnmute = () => {
    setShowMute(false);
    muteMutation.mutate({ enabled: false });
  };
  useIsErrorToast(isError, "Failed to fetch invitations", error);
  useEffect(() => {
    if (isLoading) {
      setIsHeaderLoading(true);
    } else {
      setIsHeaderLoading(false);
    }
  }, [isLoading, setIsHeaderLoading]);
  if (!data) return null;
  const typingUsersLength = typingUsers[conversationId]?.length ?? 0;
  const uploadingUsersLength = uploadingUsers[conversationId]?.length ?? 0;
  const isTyping = typingUsersLength > 0;
  const isUploading = uploadingUsersLength > 0;
  return (
    <>
      <div
        className={`flex items-center justify-between h-15 px-5 border-b border-gray-300 dark:border-gray-600  rounded-b-lg`}
        onClick={() => {
          setShowUser(true);
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full w-full ">
            <Spinner1 size="size-4 lg:size-6"></Spinner1>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-fit">
                {data.avatar ? (
                  <div
                    className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"UserAvatar"}
                      src={data.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex justify-center items-center cursor-pointer `}
                    style={{ background: gradientBgFromName(data.name) }}
                    onClick={() => {}}
                  >
                    <div className="font-semibold text-base text-white">
                      {getInitials(data.name)}
                    </div>
                  </div>
                )}
              </div>
              <div className="transition-all duration-300 flex flex-col ">
                <div
                  className={`text-gray-800 dark:text-gray-200 font-semibold text-[16px] leading-tight cursor-pointer transition-all duration-300`}
                  onClick={() => {}}
                >
                  {data.name}
                </div>
                <div
                  className={`
       text-xs leading-none  transition-all duration-300
      ${isOnline || lastSeenAt ? "opacity-100 max-h-6" : "opacity-0 max-h-0"} ${
        isOnline ? "text-blue-500" : "text-gray-600 dark:text-gray-400"
      }
    `}
                >
                  {isOnline
                    ? isTyping
                      ? "Typing..."
                      : isUploading
                        ? "Sending..."
                        : "Online"
                    : lastSeenAt
                      ? `Last seen at ${formatDistanceToNow(lastSeenAt, { addSuffix: true })}`
                      : "Last seen a while ago"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="dark:text-gray-500 text-gray-800 flex items-center justify-center rounded-full w-9 h-9 hover:bg-gray-200 dark:hover:bg-blk5 hover:shadow-md cursor-pointer"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  if (!active) {
                    startCall(data, "Voice", "Workspace", conversationId);
                  }
                }}
              >
                <VoiceCallSvg />
              </div>
              <div
                className="dark:text-gray-500 text-gray-800 flex items-center justify-center rounded-full w-9 h-9 hover:bg-gray-200 dark:hover:bg-blk5 hover:shadow-md cursor-pointer"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  if (!active) {
                    startCall(data, "Video", "Workspace", conversationId);
                  }
                }}
              >
                <VideoCallSvg />
              </div>
            </div>
            {createPortal(
              <div
                className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
                  showUser ? "visible" : "invisible pointer-events-none"
                }`}
              >
                <div
                  ref={ref}
                  className={`transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1001 p-2 ${
                    showUser ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end w-full">
                    <Xbtn
                      onClick={() => {
                        setShowUser(false);
                      }}
                    />
                  </div>
                  <div className="px-3 pb-3 flex flex-col items-center justify-center">
                    <div className="w-fit ">
                      {data.avatar ? (
                        <div
                          className="relative lg:w-20 lg:h-20 w-15 h-15 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                          onClick={() => {}}
                        >
                          <Image
                            alt={"UserAvatar"}
                            src={data.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={`lg:w-20 lg:h-20 w-15 h-15 rounded-full flex justify-center items-center cursor-pointer`}
                          style={{ background: gradientBgFromName(data.name) }}
                          onClick={() => {}}
                        >
                          <div className="font-semibold text-2xl lg:text-3xl text-white">
                            {getInitials(data.name)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">
                      {data.name}
                    </div>
                    <div
                      className={`
                text-gray-600 dark:text-gray-400 text-sm transition-all duration-300
                ${isOnline || lastSeenAt ? "opacity-100 max-h-6" : "opacity-0 max-h-0"}
              `}
                    >
                      {isOnline
                        ? "Online"
                        : lastSeenAt
                          ? `Last seen at ${formatDistanceToNow(lastSeenAt)}`
                          : ""}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 gap-3 px-3">
                    <BtnWrapper
                      onClick={() => {
                        setShowUser(false);
                        setShowMute(false);
                      }}
                    >
                      <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Message
                      </div>
                    </BtnWrapper>
                    <div className="relative">
                      <BtnWrapper onClick={() => setShowMute((prev) => !prev)}>
                        <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                          {data.mute ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-5"
                            >
                              <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.57 16.476c-.223.082-.448.161-.674.238L7.319 4.137A6.75 6.75 0 0 1 18.75 9v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206Z" />
                              <path
                                fillRule="evenodd"
                                d="M5.25 9c0-.184.007-.366.022-.546l10.384 10.384a3.751 3.751 0 0 1-7.396-1.119 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {data.mute ? "Unmute" : "Mute"}
                        </div>
                      </BtnWrapper>
                      {showMute && (
                        <div
                          className="fixed inset-0 z-[98]"
                          style={{ pointerEvents: "auto" }}
                          onClick={() => setShowMute(false)} // click anywhere closes menu
                        />
                      )}
                      <div
                        className={`z-99 absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full bg-gray-200 dark:bg-blk3 text-gray-800 dark:text-gray-200 text-xs rounded-md shadow-lg dark:shadow-black/30  p-2 min-w-30 transition-all duration-300 ${
                          showMute
                            ? "opacity-100 pointer-events-auto visible"
                            : "opacity-0 pointer-events-none invisible"
                        }`}
                      >
                        {showMute &&
                          (!data.mute || !data.mutedAt ? (
                            <ul>
                              <li
                                className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                                onClick={() => {
                                  handleMute("Eight");
                                }}
                              >
                                8 hrs
                              </li>
                              <li
                                className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 text-nowrap"
                                onClick={() => {
                                  handleMute("Week");
                                }}
                              >
                                1 week
                              </li>
                              <li
                                className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                                onClick={() => {
                                  handleMute("Always");
                                }}
                              >
                                Always
                              </li>
                            </ul>
                          ) : (
                            <ul>
                              <li className=" px-2 py-1  text-nowrap dark:text-gray-700 text-gray-500 ">
                                {muteDateFormatter(data.mute, data.mutedAt)}
                              </li>
                              <li
                                className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                                onClick={() => {
                                  handleUnmute();
                                }}
                              >
                                Unmute
                              </li>
                            </ul>
                          ))}
                      </div>
                    </div>
                    <BtnWrapper
                      disable={active}
                      onClick={() => {
                        startCall(data, "Voice", "Workspace", conversationId);
                      }}
                    >
                      <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                        <VoiceCallSvg />
                        Voice
                      </div>
                    </BtnWrapper>
                    <BtnWrapper
                      disable={active}
                      onClick={() => {
                        startCall(data, "Video", "Workspace", conversationId);
                      }}
                    >
                      <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                        <VideoCallSvg />
                        Video
                      </div>
                    </BtnWrapper>
                  </div>
                  <div className="border-y border-gray-200 dark:border-gray-700 mt-2 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        {" "}
                        <div className="text-blue-500 ">{data.username}</div>
                        <div className="text-xs text-gray-500">Username</div>
                      </div>
                      <div
                        className="text-gray-500 group relative cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            htmlToText(data.username),
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                          />
                        </svg>
                        <Toolbar top={"-top-7"}>Copy</Toolbar>
                      </div>
                    </div>
                  </div>

                  <div
                    className=" border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-1"
                    onClick={() => {
                      setClearWarn(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-eraser"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z" />
                    </svg>
                    Clear chat
                  </div>
                  <div
                    className="text-red-500 py-2 px-3 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-1"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setDeleteWarn(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    Delete
                  </div>
                </div>
              </div>,
              document.body,
            )}
            {createPortal(
              <OverlayWrapper active={clearWarn}>
                <div className="lg:w-sm w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-fit">
                      {data.avatar ? (
                        <div className="relative  h-9 w-9 lg:h-11 lg:w-11 rounded-full overflow-hidden ">
                          <Image
                            alt={"AssigneeAvatar"}
                            src={data.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  `}
                          style={{
                            background: gradientBgFromName(data.name),
                          }}
                        >
                          <div className="font-semibold lg:text-lg text-base text-white ">
                            {getInitials(data.name)}
                          </div>
                        </div>
                      )}
                    </div>{" "}
                    <div className="text-gray-900 dark:text-gray-100 text-base lg:text-lg text-ellipsis font-semibold">
                      {data.name}
                    </div>
                  </div>
                  <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
                    Are you sure you want to clear all messages from this chat?
                  </div>
                  <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
                    *Messages will only be cleared from your side.
                  </div>
                  <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
                    <button
                      className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                      onClick={() => {
                        setClearWarn(false);
                      }}
                    >
                      cancel
                    </button>
                    <button
                      className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
                      onClick={() => {
                        // handleClearMsgs();
                        setClearWarn(false);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </OverlayWrapper>,
              document.body,
            )}
            {createPortal(
              <OverlayWrapper active={deleteWarn}>
                <div className="w-xs lg:w-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-fit">
                      {data.avatar ? (
                        <div className="relative  h-9 w-9 lg:h-11 lg:w-11 rounded-full overflow-hidden ">
                          <Image
                            alt={"AssigneeAvatar"}
                            src={data.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  `}
                          style={{
                            background: gradientBgFromName(data.name),
                          }}
                        >
                          <div className="font-semibold lg:text-lg text-base text-white ">
                            {getInitials(data.name)}
                          </div>
                        </div>
                      )}
                    </div>{" "}
                    <div className="text-gray-900 dark:text-gray-100 text-base lg:text-lg text-ellipsis font-semibold">
                      {data.name}
                    </div>
                  </div>
                  <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md mt-1">
                    Are you sure you want to delete this chat?
                  </div>
                  <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
                    <button
                      className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                      onClick={() => {
                        setDeleteWarn(false);
                      }}
                    >
                      cancel
                    </button>
                    <button
                      className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
                      onClick={() => {
                        // handleDelete();
                        setDeleteWarn(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </OverlayWrapper>,
              document.body,
            )}
          </>
        )}
      </div>
    </>
  );
}

export function BtnWrapper({
  children,
  onClick,
  addOns,
  disable,
}: {
  children: ReactNode;
  onClick: () => void;
  addOns?: string;
  disable?: boolean;
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-blk6 rounded-lg w-18 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-blk8 ${addOns} aria-disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none `}
      aria-disabled={disable}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
