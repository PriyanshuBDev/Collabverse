import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import { useRef, useState } from "react";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { createPortal } from "react-dom";
import RoleChange from "@/components/warnings/RoleChange";
import RemoveUserWarning from "@/components/warnings/RemoveUserWarning";
import { taskRolesArray } from "@/lib/constants/constants";
import useMounted from "@/lib/hooks/useMounted";
import { TaskRole } from "@prisma/client";
import { taskMembersProps } from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { UpDownArrowSvg } from "@/components/svg/UpDownArrowSvg";
import { CircleMinusSvg } from "@/components/svg/CircleMinusSvg";
import Toolbar from "@/components/helpers/Toolbar";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function TaskUserCard({
  taskName,
  user,
  canChange,
  handleRoleChange,
  handleRemove,
}: {
  taskName: string;
  user: taskMembersProps;
  canChange: boolean;
  handleRoleChange: (role: TaskRole, userId: string) => void;
  handleRemove: (userId: string) => void;
}) {
  const { id } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const [role, setRole] = useState(user.role);
  const roles = taskRolesArray;
  const [dropdown, setDropDown] = useState(false);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const mounted = useMounted();
  const dropRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dropRef], () => {
    setDropDown(false);
  });
  if (!mounted) return null;
  return (
    <>
      <div
        className={`w-full transition-all duration-300 ease-out hover:bg-gray-200 hover:dark:bg-blk8  px-2 py-1 rounded-md cursor-pointer`}
      >
        <FlexBtwWrapper>
          <div className="flex items-center gap-2">
            <div
              className="w-fit cursor-pointer"
              onClick={() => {
                if (user.id !== id) {
                  setUserId(user.id);
                }
              }}
            >
              {user.avatar ? (
                <div className="relative w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden  ">
                  <Image
                    alt={"MembersAvatar"}
                    src={user.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex justify-center items-center `}
                  style={{ background: gradientBgFromName(user.name) }}
                >
                  <div className="font-semibold text-xs text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
              )}
            </div>
            <div className="">
              <div
                className="text-gray-800 dark:text-gray-200 text-sm lg:text-base text-nowrap cursor-pointer hover:underline"
                onClick={() => {
                  if (user.id !== id) {
                    setUserId(user.id);
                  }
                }}
              >
                {user.id === id ? "You" : user.name}
              </div>
              <div
                className="text-blue-500  text-xs text-nowrap cursor-pointer hover:underline"
                onClick={() => {
                  if (user.id !== id) {
                    setUserId(user.id);
                  }
                }}
              >
                {user.username}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canChange ? (
              <div
                ref={dropRef}
                className="relative lg:min-w-30 min-w-25 cursor-pointer"
              >
                <div
                  className="border dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-23 lg:w-30 px-2 lg:px-3 py-0.5 flex items-center justify-between gap-1"
                  onClick={() => {
                    setDropDown((prev) => !prev);
                  }}
                >
                  <div className="text-xs lg:text-sm">{user.role}</div>
                  <div className="text-gray-500">
                    <UpDownArrowSvg size="w-4 h-4" />
                  </div>
                </div>
                <div
                  id="dropdown"
                  className={`z-30 py-1  shadow-lg absolute top-0 -left-1 w-23 lg:w-32  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
                    dropdown
                      ? "opacity-100 visible"
                      : "opacity-0 invisible pointer-events-none"
                  }`}
                >
                  {roles.map((r: TaskRole, idx: number) => (
                    <div
                      className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
                        r === user.role && "border-l-4 border-blue-500"
                      }`}
                      onClick={() => {
                        setDropDown(false);
                        if (user.role === r) return;
                        setShowRoleWarning(true);
                        setRole(r);
                      }}
                      key={idx}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300">
                {user.role}
              </div>
            )}

            {canChange && (
              <button
                className={` cursor-pointer text-gray-500 text-xs lg:text-sm font-semibold  relative group mr-3`}
                onClick={() => {
                  setShowRemoveWarning(true);
                }}
              >
                <CircleMinusSvg />
                <Toolbar top="-top-6">Remove</Toolbar>
              </button>
            )}
          </div>
        </FlexBtwWrapper>
      </div>{" "}
      {createPortal(
        <RoleChange
          showWarning={showRoleWarning}
          setShowWarning={setShowRoleWarning}
          currentRole={user.role}
          newRole={role}
          user={user}
          handleRoleChange={() => {
            handleRoleChange(role, user.id);
          }}
          name={taskName}
          type="Task"
        />,
        document.body,
      )}
      {createPortal(
        <RemoveUserWarning
          showWarning={showRemoveWarning}
          setShowWarning={setShowRemoveWarning}
          handleRemove={() => {
            handleRemove(user.id);
          }}
          user={user}
          type="task"
          name={taskName}
        />,
        document.body,
      )}
    </>
  );
}
