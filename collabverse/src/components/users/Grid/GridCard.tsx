import {
  Tier,
  usersProjFilterProps,
  usersTaskFilterProps,
  wsUserProps,
} from "@/app/interfaces";
import RemoveUserWarning from "@/components/warnings/RemoveUserWarning";
import RoleChange from "@/components/warnings/RoleChange";
import { combinedRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import useMounted from "@/lib/hooks/useMounted";
import Image from "next/image";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import DropDown from "../DropDown";
import RemoveDD from "../RemoveDD";
import { useRemovePerm } from "@/lib/hooks/useRemovePerm";
import { useRoleChange } from "@/lib/hooks/useRoleChange";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import ViewerRoleChangeWarning from "@/components/warnings/ViewerRoleChangeWarning";
import { useUserStatus } from "@/lib/hooks/conversation/useUserStatus";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function GridCard({
  user,
  onRemove,
  removing,
  onChangeRole,
  changingRole,
  project,
  task,
  type,
}: {
  user: wsUserProps;
  onRemove: () => void;
  removing: boolean;
  onChangeRole: (role: combinedRoleChange) => void;
  changingRole: boolean;
  project?: usersProjFilterProps;
  task?: usersTaskFilterProps;
  type: Tier;
}) {
  const currentUser = useCurrentUser();
  const removePerm = useRemovePerm({
    type,
    pRole: project?.role,
    userRole: user.role,
    projectPerms: project?.managerPerms,
    isSelf: currentUser.id === user.id,
  });
  const roleChange = useRoleChange({
    type,
    pRole: project?.role,
    userRole: user.role,
    isSelf: currentUser.id === user.id,
  });
  const { isOnline } = useUserStatus({
    userId: user.id,
    lastSeenAt: null,
  });
  const setUserId = useShowUserStore((s) => s.setUserId);
  const [showOptions, setShowOptions] = useState(false);
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const [showViewerWarning, setShowViewerWarning] = useState(false);
  const [removeWarning, setRemoveWarning] = useState(false);
  const mounted = useMounted();
  const [selectedRole, setSelectedRole] = useState<combinedRoleChange>();
  const [dropdown, setDropDown] = useState(false);
  const ws = useCurrentWorkspace();
  const dropRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dropRef], () => {
    if (showRoleWarning) return;
    setDropDown(false);
  });
  useClickOutSide([optionsRef], () => {
    setShowOptions(false);
  });
  const handleRoleChange = () => {
    if (!selectedRole) return;
    onChangeRole(selectedRole);
    setSelectedRole(undefined);
    setDropDown(false);
    setShowRoleWarning(false);
  };
  if (!mounted) return null;
  const name =
    type === "Workspace"
      ? ws.name
      : type === "Project"
        ? (project?.name ?? "")
        : (task?.name ?? "");
  return (
    <>
      <div className="relative cursor-pointer lg:p-5 p-3 h-full w-full dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_3px_10px_rgba(0,0,0,0.7)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-xl bg-white dark:bg-blk3">
        {removePerm && (
          <div ref={optionsRef} className="absolute top-3 right-3">
            <div
              className=" p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-blk5"
              onClick={(e) => {
                e.stopPropagation();
                if (removing) return;
                setShowOptions((prev) => !prev);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 lg:size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </div>

            <RemoveDD
              type={type}
              setWarning={setRemoveWarning}
              setShowOptions={setShowOptions}
              showOptions={showOptions}
              projectRole={project?.role ?? undefined}
              userRole={user.role}
              projectPerms={project?.managerPerms ?? []}
            ></RemoveDD>
          </div>
        )}
        <div className="flex flex-col items-center justify-center">
          <div
            className="w-fit relative"
            onClick={() => {
              if (user.id !== currentUser.id) setUserId(user.id);
            }}
          >
            {user.avatar ? (
              <div className="relative w-9 h-9 lg:h-12 lg:w-12 rounded-full overflow-hidden ">
                <Image
                  alt={"AssigneeAvatar"}
                  src={user.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-9 h-9 lg:h-12 lg:w-12 rounded-full flex justify-center items-center  `}
                style={{ background: gradientBgFromName(user.name) }}
              >
                <div className="font-semibold text-sm lg:text-lg text-white">
                  {getInitials(user.name)}
                </div>
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full  ${isOnline ? "bg-green-500" : ""}`}
            />
          </div>
          <div
            className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 "
            onClick={() => {
              if (user.id !== currentUser.id) setUserId(user.id);
            }}
          >
            {user.id === currentUser.id ? "You" : user.name}
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className="text-xs lg:text-sm text-blue-500"
              onClick={() => {
                if (user.id !== currentUser.id) setUserId(user.id);
              }}
            >
              {user.username}
            </div>
            <div className="text-xs">{DateFormatter2(user.joinedAt)}</div>
          </div>
        </div>
        {type === "Workspace" ? (
          <div className="flex items-center justify-around gap-1 my-2">
            <div className="flex items-center gap-0.5 xl:gap-1">
              <div className="text-gray-600  dark:text-gray-300 font-semibold flex items-center text-xs">
                {user.projects ?? 0}{" "}
                {user.projects && user.projects > 1 ? "Projects" : "Project"}
              </div>
            </div>
            <div className="flex items-center gap-0.5 xl:gap-1">
              <div className="text-gray-600  dark:text-gray-300 font-semibold flex items-center text-xs">
                {user.tasks ?? 0}{" "}
                {user.tasks && user.tasks > 1 ? "Tasks" : "Task"}
              </div>
            </div>
          </div>
        ) : type === "Project" ? (
          <div className="flex justify-center my-2 ">
            <div className="flex items-center gap-0.5 xl:gap-1">
              <div className="text-gray-600  dark:text-gray-300 font-semibold flex items-center text-xs">
                {user.tasks ?? 0}{" "}
                {user.tasks && user.tasks > 1 ? "Tasks" : "Task"}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div
          className={`flex justify-center w-full ${type === "Task" ? "mt-2" : ""}`}
        >
          {roleChange ? (
            <div className="relative  text-gray-700 dark:text-gray-300 flex justify-center w-full">
              <div
                className="border dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-24 lg:w-32 px-2 lg:px-3 py-0.5 flex items-center justify-between gap-1"
                onClick={() => {
                  if (changingRole) return;
                  setDropDown((prev) => !prev);
                }}
              >
                <div className="text-sm lg:text-base">{user.role}</div>
                <div>
                  <svg
                    className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 "
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
                      d="m8 15 4 4 4-4m0-6-4-4-4 4"
                    />
                  </svg>
                </div>
              </div>
              {dropdown && (
                <div className="inset-0 fixed  z-98 bg-transparent"></div>
              )}
              <div
                ref={dropRef}
                id="dropdown"
                className={`z-99 py-1  shadow-lg absolute top-0 left-1/2 -translate-x-1/2 w-24 lg:w-32  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
                  dropdown
                    ? "opacity-100 visible"
                    : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <DropDown
                  setRole={setSelectedRole}
                  setWarning={setShowRoleWarning}
                  userRole={user.role}
                  type={type}
                  setShowViewerWarning={setShowViewerWarning}
                  assignedTasks={user.assignedTasksInProject}
                ></DropDown>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 font-semibold">
              {user.role}
            </div>
          )}
        </div>
      </div>
      {mounted &&
        createPortal(
          <RoleChange
            name={name}
            type={type}
            setShowWarning={setShowRoleWarning}
            showWarning={showRoleWarning}
            newRole={selectedRole ?? ""}
            user={user}
            handleRoleChange={handleRoleChange}
            currentRole={user.role}
            setShowDropdown={setDropDown}
            ownerOf={user.ownedProjects}
            currentOwner={type === "Project" && user.role === "Owner"}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <RemoveUserWarning
            name={name}
            setShowWarning={setRemoveWarning}
            showWarning={removeWarning}
            user={user}
            handleRemove={onRemove}
            type={type}
            ownerOf={user.ownedProjects}
            currentOwner={type === "Project" && user.role === "Owner"}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <ViewerRoleChangeWarning
            showWarning={showViewerWarning}
            setShowWarning={setShowViewerWarning}
          />,
          document.body,
        )}
    </>
  );
}
