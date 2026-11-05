import { groupUsersProps } from "@/app/interfaces";
import ClickAnywhere from "@/components/dropdowns/ClickAnywhere";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { useRef, useState } from "react";
import { PositionProps } from "../chatArea/bubble/ChatBubble";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { GroupRole } from "@prisma/client";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { handleContextMenu } from "@/lib/functions/chat/handleContextMenu";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function GroupMembersCard({
  m,
  currentUserRole,
  handleRemove,
  handleRoleChange,
}: {
  m: groupUsersProps;
  currentUserRole?: GroupRole;
  handleRoleChange: (role: GroupRole) => void;
  handleRemove: () => void;
}) {
  const { id: currentUserId } = useCurrentUser();
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const closeMenu = () => {
    setMenuPos(null);
  };
  const setUserId = useShowUserStore((s) => s.setUserId);
  useClickOutSide([ref], closeMenu);
  const isYou = (member: groupUsersProps) => {
    return member.id === currentUserId ? "You" : member.name;
  };
  return (
    <div
      key={m.id}
      ref={ref}
      className={`hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg active:scale-98 transition-transform duration-150 ${
        menuPos ? "bg-gray-200 dark:bg-blk8" : ""
      }`}
      onContextMenu={(e) => {
        if (currentUserId === m.id) return;
        handleContextMenu(e, setMenuPos, menuPos);
      }}
    >
      <FlexBtwWrapper>
        <div className="flex items-center gap-2 ">
          <div className="w-fit ">
            {m.avatar ? (
              <div
                className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                onClick={() => {
                  if (m.id !== currentUserId) setUserId(m.id);
                }}
              >
                <Image
                  alt={"projectAvatar"}
                  src={m.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-full flex justify-center items-center cursor-pointer `}
                style={{ background: gradientBgFromName(m.name) }}
                onClick={() => {}}
              >
                <div className="font-semibold text-sm text-white">
                  {getInitials(m.name)}
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold ">
              {isYou(m)}
            </div>
            {isYou(m) !== "You" && (
              <div className="text-xs text-blue-500">{m.username}</div>
            )}
          </div>
        </div>
        <div
          className={`text-gray-600 dark:text-gray-400 text-sm ${
            m.role === "Admin" ? "mr-2.5" : ""
          }`}
        >
          {m.role}
        </div>
      </FlexBtwWrapper>
      <ClickAnywhere
        menuPos={menuPos}
        setMenuPos={setMenuPos}
        bg="bg-gray-300 dark:bg-blk5"
      >
        <ul className="px-1">
          <li className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk8 rounded-md">
            <div className="w-fit text-gray-700 dark:text-gray-300">
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
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
            <div className="text-gray-800 dark:text-gray-200 text-sm">
              Open Chat
            </div>
          </li>
          {currentUserRole === "Admin" && (
            <>
              <li
                className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk8 rounded-md"
                onClick={handleRemove}
              >
                <div className="w-fit text-gray-700 dark:text-gray-300">
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
                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div className="text-gray-800 dark:text-gray-200 text-sm">
                  Remove
                </div>
              </li>
              {m.role === "Member" ? (
                <li
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk8 rounded-md"
                  onClick={() => handleRoleChange("Admin")}
                >
                  <div className="w-fit text-gray-700 dark:text-gray-300">
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
                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 text-sm">
                    Make admin
                  </div>
                </li>
              ) : (
                <li
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk8 rounded-md"
                  onClick={() => handleRoleChange("Member")}
                >
                  <div className="w-fit text-gray-700 dark:text-gray-300">
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
                        d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 text-sm">
                    Dismiss as admin
                  </div>
                </li>
              )}
            </>
          )}
        </ul>
      </ClickAnywhere>
    </div>
  );
}
