import { GroupHeaderProps, memberProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { createPortal } from "react-dom";
import GroupDetailsArea from "./GroupDetailsArea";
import useMounted from "@/lib/hooks/useMounted";
import { useConversationBroadcast } from "@/lib/hooks/realtime/Conversation/useConversationBroadcast";

export default function GroupHeader({
  headerData,
  setIsHeaderLoading,
}: {
  headerData: GroupHeaderProps;
  setIsHeaderLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { typingUsers, uploadingUsers } = useConversationBroadcast();
  const { id: currentUserId } = useCurrentUser();
  const [showGroup, setShowGroup] = useState(false);
  const mounted = useMounted();
  if (!mounted) return null;
  const typingUsersLength = typingUsers[headerData.id]?.length ?? 0;
  const uploadingUsersLength = uploadingUsers[headerData.id]?.length ?? 0;
  const isTyping = typingUsersLength > 0;
  const isUploading = uploadingUsersLength > 0;

  return (
    <>
      <div
        className={`flex items-center justify-between h-15 px-5 border-b border-gray-300 dark:border-gray-600  rounded-b-lg`}
        onClick={() => {
          setShowGroup(true);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-fit">
            {headerData.currentUserStatus === "Active" ? (
              headerData.avatar ? (
                <div
                  className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                  onClick={() => {}}
                >
                  <Image
                    alt={"GroupAvatar"}
                    src={headerData.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex justify-center items-center cursor-pointer`}
                  style={{ background: gradientBgFromName(headerData.name) }}
                  onClick={() => {}}
                >
                  <div className="font-semibold lg:text-base text-sm text-white">
                    {getInitials(headerData.name)}
                  </div>
                </div>
              )
            ) : (
              <div
                className={` w-9 h-9 rounded-full flex justify-center items-center  bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="transition-all duration-300 flex flex-col ">
            <div
              className={`text-gray-800 dark:text-gray-200 font-semibold text-[16px] leading-tight cursor-pointer
            transition-all duration-300
          `}
              onClick={() => {}}
            >
              {headerData.name}
            </div>
            <div
              className={`
            ${isTyping || isUploading ? "text-blue-500" : "text-gray-600 dark:text-gray-400"}  text-xs   transition-all duration-300 text-ellipsis line-clamp-1
            ${
              headerData.members.length > 0
                ? "opacity-100 max-h-6"
                : "opacity-0 max-h-0"
            }
          `}
            >
              {isTyping && isUploading ? (
                `${typingUsersLength} ${typingUsersLength > 1 ? "users are" : "user is"} typing and ${uploadingUsersLength} ${uploadingUsersLength > 1 ? "users are" : "users is"} sending media...`
              ) : isTyping ? (
                `${typingUsersLength > 1 ? `${typingUsersLength} users are typing...` : `${headerData.members.find((m: memberProps) => m.id === typingUsers[headerData.id][0])?.name ?? `A user`} is typing...`}`
              ) : isUploading ? (
                `${uploadingUsersLength > 1 ? `${uploadingUsersLength} users are sending media...` : `${headerData.members.find((m: memberProps) => m.id === uploadingUsers[headerData.id][0])?.name ?? `A user`} is sending media...`}`
              ) : (
                <>
                  {headerData.currentUserStatus === "Active" ? "You, " : ""}
                  {headerData.members
                    .filter((m: memberProps) => m.id !== currentUserId)
                    .map((m: memberProps, idx: number) => (
                      <span key={idx}>
                        {m.name}
                        {headerData.members.length === idx + 1 ? "" : ", "}
                      </span>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {createPortal(
        <GroupDetailsArea
          show={showGroup}
          setShow={setShowGroup}
          setIsHeaderLoading={setIsHeaderLoading}
        />,
        document.body,
      )}
    </>
  );
}
