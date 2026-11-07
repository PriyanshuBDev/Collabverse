import { chatListProps } from "@/app/interfaces";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import chatDateFormatter from "@/lib/functions/date/chatDateFormatter";
import { useState } from "react";
import { PositionProps } from "../../ChatComponents/Bubble";
import muteDateFormatter from "@/lib/functions/date/muteDateFormatter";
import ClickAnywhere from "../../dropdowns/ClickAnywhere";
import { PinSvg } from "@/components/svg/PinSvg";
import { MuteSvg, UnmuteSvg } from "@/components/svg/MuteSvg";
import { handleContextMenu } from "@/lib/functions/chat/handleContextMenu";
import { MuteEnum } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { GroupSvgLight } from "@/components/svg/GroupSvg";
import { ClockSvgLight } from "@/components/svg/ClockSvg";
import { DoubleTickSvg, SingleTickSvg } from "@/components/svg/TickSvg";
import { FormatLastMsg } from "@/lib/functions/chat/formatMsg";
import { MsgBubbleSvg } from "@/components/svg/MsgBubbleSvg";
import { LeaveSvg } from "@/components/svg/LeaveSvg";
import { RemoveConvoWarning } from "@/components/warnings/RemoveConvoWarning";
import { DustbinSvg } from "@/components/svg/DustbinSvg";
import { getTotalMembersCount } from "@/lib/axios/workspace/conversation/group/getTotalMembersCount";
import { toast } from "sonner";
import Spinner1 from "@/components/loadings/Spinner1";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import AutoDeleteWarning from "@/components/warnings/AutoDeleteWarning";
import { GroupLeaveWarning } from "@/components/warnings/GroupLeaveWarning";
import { ConvoClearMsgWarning } from "@/components/warnings/ConvoClearMsgWarning";
import { useLeaveGroup } from "@/lib/queries/workspace/conversation/group/useLeaveGroup";
import { OutgoingArrowSvg } from "@/components/svg/OutgoingArrowSvg";
import { IncomingArrowSvg } from "@/components/svg/IncomingArrowSvg";
type convoSidebarCardProps = {
  c: chatListProps;
  handleMarkAllAsRead: () => void;
  workspaceSlug: string;
  currentUserId: string;
  handleTogglePin: () => void;
  handleClearChat: () => void;
  handleDeleteChat: () => void;
  handleMuting: (enabled: boolean, muteType?: MuteEnum) => void;
  isPending: boolean;
};
export default function ConvoSidebarCard({
  c,
  handleMarkAllAsRead,
  workspaceSlug,
  currentUserId,
  handleTogglePin,
  handleClearChat,
  handleDeleteChat,
  handleMuting,
  isPending,
}: convoSidebarCardProps) {
  const params = useParams<{
    conversationId: string;
  }>();
  const { id: workspaceId } = useCurrentWorkspace();
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const [removeWarn, setRemoveWarn] = useState(false);
  const [leaveWarn, setLeaveWarn] = useState(false);
  const [autoDeleteWarn, setAutoDeleteWarn] = useState(false);
  const [clearWarn, setClearWarn] = useState(false);
  const router = useRouter();
  const leave = useLeaveGroup(c.id);
  let isLast = false;
  const handleLeaveValidation = async () => {
    try {
      const usersLength = await getTotalMembersCount({
        workspaceId,
        conversationId: c.id,
      });
      if (usersLength === 1) {
        isLast = true;
      }
    } catch (e) {
      console.error(e);
      toast.error(
        `Something went wrong. Please try ${c.type === "Dm" ? "deleting the chat" : "leaving the group"} later`,
      );
    }
  };
  if (leave.isPending || isPending) {
    return (
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 visible`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }
  const closeMenu = () => {
    setMenuPos(null);
  };
  const handleMute = async (mute: MuteEnum) => {
    handleMuting(true, mute);
    closeMenu();
  };
  const handleUnmute = () => {
    handleMuting(false);
    closeMenu();
  };
  const isYou = (name: string, id?: string) => {
    return id === currentUserId ? "You" : name;
  };
  const allowed =
    c.type === "Dm" || (c.type === "Group" && c.membership === "Active");

  const isActive = params.conversationId === c.id;
  const isUser = c.lastMessage?.messagedBy.id === currentUserId;
  return (
    <div
      className={`flex items-center gap-4 ${isActive ? "bg-emerald-200 dark:bg-emerald-700/40 hover:bg-emerald-300 dark:hover:bg-emerald-700/60" : "hover:bg-gray-300 dark:hover:bg-blk4"} px-3 py-1 rounded-md cursor-pointer flex-1 min-w-0 max-h-15 ${
        menuPos ? "bg-gray-300 dark:bg-blk4" : ""
      }`}
      onContextMenu={(e) => handleContextMenu(e, setMenuPos, menuPos)}
      onClick={() => {
        if (
          c.type === "Group" &&
          (c.membership === "Kicked" || c.membership === "Left")
        )
          return;
        if (!isActive) {
          router.push(`/app/${workspaceSlug}/conversation/${c.id}`);
        }
      }}
    >
      <div className="w-fit ml-1">
        {allowed ? (
          c.avatar ? (
            <div className="relative  h-11 w-11 rounded-full overflow-hidden ">
              <Image
                alt={"UserAvatar"}
                src={c.avatar}
                className="object-center object-cover"
                fill
              ></Image>
            </div>
          ) : (
            <div
              className={` h-11 w-11 rounded-full flex justify-center items-center  `}
              style={{ background: gradientBgFromName(c.name) }}
            >
              <div className="font-semibold text-lg text-white ">
                {getInitials(c.name)}
              </div>
            </div>
          )
        ) : (
          <div
            className={` h-11 w-11 rounded-full flex justify-center items-center  bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400`}
          >
            <GroupSvgLight size="size-6" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between w-full gap-3">
          <div className="text-gray-900 dark:text-gray-100 text-sm text-ellipsis font-semibold">
            {c.name}
          </div>

          {(!c.membership || c.membership === "Active") && (
            <div
              className={`${
                c.unread ? "text-blue-500" : "text-gray-500"
              } text-xs`}
            >
              {chatDateFormatter(new Date(c.lastActivityAt))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1 ">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {c.membership === "Kicked" ? (
              <div className="text-gray-500 text-xs truncate flex-1 min-w-0">
                You were kicked out
              </div>
            ) : !c.lastMessage ||
              c.lastMessage?.isDeletedForUser ||
              c.lastMessage?.isDeleted ? (
              <></>
            ) : (
              <>
                {c.lastMessage.messagedBy.id === currentUserId &&
                  c.lastMessage.type !== "call" && (
                    <div className="flex-shrink-0">
                      {c.lastMessage.isRead ? (
                        <div className={`text-blue-500`}>
                          <DoubleTickSvg size="size-4" />
                        </div>
                      ) : c.lastMessage.sentAt ? (
                        <div className="text-gray-500">
                          <SingleTickSvg size="size-4" />
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <ClockSvgLight size="size-4" />
                        </div>
                      )}
                    </div>
                  )}

                {c.lastMessage && (
                  <div
                    className={`${c.lastMessage.type === "call" ? "text-grey-800 dark:text-gray-200" : "text-gray-500"} text-xs truncate flex-1 min-w-0 flex gap-1 items-center`}
                  >
                    {c.type === "Group"
                      ? `${isYou(c.lastMessage.messagedBy.name, c.lastMessage.messagedBy.id)}: ${FormatLastMsg(c.lastMessage, isUser)}`
                      : FormatLastMsg(c.lastMessage, isUser)}
                    {c.lastMessage.type === "call" &&
                      (isUser ? (
                        <OutgoingArrowSvg
                          size="size-2 lg:size-3"
                          strokeWidth={2}
                        />
                      ) : (
                        <IncomingArrowSvg
                          size="size-2 lg:size-3"
                          strokeWidth={2}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 justify-end">
            {c.mute && (
              <div className="w-fit text-gray-500">
                <MuteSvg />
              </div>
            )}
            {c.pinIdx !== undefined && c.pinIdx > -1 && (
              <div className="w-fit text-gray-500">
                <PinSvg size={"size-4"} />
              </div>
            )}
            {c.unread > 0 && allowed && (
              <div className="w-fit">
                <div
                  className={`text-white text-[11px] bg-blue-500 rounded-full flex items-center justify-center ${
                    c.unread > 9 ? "px-1" : "px-1.5"
                  }`}
                >
                  {c.unread}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ClickAnywhere setMenuPos={setMenuPos} menuPos={menuPos}>
        <ul>
          {allowed && (
            <>
              {c.unread > 0 && (
                <li
                  className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
                  onClick={() => {
                    handleMarkAllAsRead();
                    closeMenu();
                  }}
                >
                  <MsgBubbleSvg size="size-4" />
                  Mark as read
                </li>
              )}
              <li
                className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
                onClick={() => {
                  handleTogglePin();
                }}
              >
                <div className="relative">
                  <PinSvg size="size-4" />

                  {c.pinIdx !== undefined && c.pinIdx > -1 && (
                    <div className="w-0.5 h-5 rotate-135 bg-gray-800 dark:bg-gray-200 border dark:border-blk3 border-gray-50 rounded absolute -top-1 left-2"></div>
                  )}
                </div>
                {c.pinIdx !== undefined ? "Unpin" : "Pin"}
              </li>
              <li className="group relative px-2">
                <div className="p-1 group-hover:bg-gray-100 dark:group-hover:bg-blk8 cursor-pointer flex items-center justify-between gap-2 rounded-md">
                  <div className="flex items-center gap-2">
                    {c.mute ? (
                      <MuteSvg size="size-4" />
                    ) : (
                      <UnmuteSvg size="size-4" />
                    )}
                    {c.mute ? "Muted" : "Mute"}
                  </div>
                  <div>
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
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </div>
                {!c.mute || !c.mutedAt ? (
                  <ul className="absolute left-42 top-0 bg-gray-200 dark:bg-blk3 rounded-md shadow-lg dark:shadow-black/30  p-2 min-w-30  group-hover:opacity-100 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto pointer-events-none">
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
                  <ul className="absolute left-42 top-0 bg-gray-200 dark:bg-blk3 rounded-md shadow-lg dark:shadow-black/30 divide-y flex flex-col gap-1 dark:divide-gray-500 divide-gray-300 p-2 min-w-30  group-hover:opacity-100 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto pointer-events-none">
                    <li className=" px-2 py-1  text-nowrap dark:text-gray-700 text-gray-500 ">
                      {muteDateFormatter(c.mute, c.mutedAt)}
                    </li>
                    <li
                      className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                      onClick={handleUnmute}
                    >
                      Unmute
                    </li>
                  </ul>
                )}
              </li>
              {c.lastMessage && (
                <li
                  className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
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
                  Clear messages
                  <ConvoClearMsgWarning
                    setShow={setClearWarn}
                    show={clearWarn}
                    handleClearing={handleClearChat}
                    name={c.name}
                    avatar={c.avatar}
                    type={c.type}
                    closeMenu={() => {}}
                  />
                </li>
              )}
            </>
          )}
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={async () => {
              setRemoveWarn(true);
              if (c.type === "Dm") {
                setRemoveWarn(true);
              } else {
                setLeaveWarn(true);
                await handleLeaveValidation();
              }
            }}
          >
            {c.membership === "Active" ? (
              <>
                {" "}
                <LeaveSvg size="size-4" />
                Leave
              </>
            ) : (
              <>
                {" "}
                <DustbinSvg size="size-4" />
                Delete
              </>
            )}
            <RemoveConvoWarning
              setShow={setRemoveWarn}
              show={removeWarn}
              c={c}
              closeMenu={closeMenu}
              remove={handleDeleteChat}
            />
            <GroupLeaveWarning
              setAutoDeleteWarn={setAutoDeleteWarn}
              setShow={setLeaveWarn}
              show={leaveWarn}
              name={c.name}
              avatar={c.avatar}
              handleLeaving={() => leave.mutate({ name: c.name })}
              isLast={isLast}
              closeMenu={() => {}}
            />
            <AutoDeleteWarning
              setShow={setAutoDeleteWarn}
              show={autoDeleteWarn}
              leaveGroup={() => leave.mutate({ name: c.name })}
              closeMenu={() => {}}
            />
          </li>
        </ul>
      </ClickAnywhere>
    </div>
  );
}
