import {
  Tier,
  usersProjFilterProps,
  usersTaskFilterProps,
  wsUserProps,
} from "@/app/interfaces";
import RemoveUserWarning from "@/components/warnings/RemoveUserWarning";
import RoleChange from "@/components/warnings/RoleChange";
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
import { combinedRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import RemoveDD from "../RemoveDD";
import { useRemovePerm } from "@/lib/hooks/useRemovePerm";
import { useRoleChange } from "@/lib/hooks/useRoleChange";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import ViewerRoleChangeWarning from "@/components/warnings/ViewerRoleChangeWarning";
import { useUserStatus } from "@/lib/hooks/conversation/useUserStatus";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function ListCard({
  user,
  type,
  onChangeRole,
  onRemove,
  removing,
  changingRole,
  project,
  task,
}: {
  user: wsUserProps;
  type: Tier;
  onRemove: () => void;
  removing: boolean;
  onChangeRole: (role: combinedRoleChange) => void;
  changingRole: boolean;
  project?: usersProjFilterProps;
  task?: usersTaskFilterProps;
}) {
  const currentUser = useCurrentUser();
  const [showOptions, setShowOptions] = useState(false);
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const [showViewerWarning, setShowViewerWarning] = useState(false);
  const [removeWarning, setRemoveWarning] = useState(false);
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
  const ws = useCurrentWorkspace();
  const mounted = useMounted();
  const [selectedRole, setSelectedRole] = useState<combinedRoleChange>();
  const [dropdown, setDropDown] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dropRef], () => {
    if (showRoleWarning) return;
    setDropDown(false);
  });
  useClickOutSide([optionsRef], () => {
    setShowOptions(false);
  });
  if (!mounted) return null;
  const handleRoleChange = () => {
    if (!selectedRole) return;
    onChangeRole(selectedRole);
    setSelectedRole(undefined);
    setDropDown(false);
    setShowRoleWarning(false);
  };

  const name =
    type === "Workspace"
      ? ws.name
      : type === "Project"
        ? (project?.name ?? "")
        : (task?.name ?? "");
  return (
    <>
      <tr
        key={user.id}
        className="bg-gray-100 border-b dark:bg-blk3 dark:border-gray-700 border-gray-200 cursor-pointer hover:bg-white dark:hover:bg-blk5"
      >
        <th
          scope="row"
          className="px-3 py-2 lg:py-3 lg:px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          <div className="flex items-center gap-2">
            <div
              className="relative w-fit"
              onClick={() => {
                if (user.id !== currentUser.id) setUserId(user.id);
              }}
            >
              {user.avatar ? (
                <div className="relative w-7 h-7 lg:h-9 lg:w-9 rounded-sm overflow-hidden ">
                  <Image
                    alt={"AssigneeAvatar"}
                    src={user.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-7 h-7 lg:h-9 lg:w-9 rounded-sm flex justify-center items-center `}
                  style={{ background: gradientBgFromName(user.name) }}
                >
                  <div className="font-semibold text-xs text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 h-2 w-2 rounded-full  ${isOnline ? "bg-green-500" : ""}`}
              />
            </div>
            <div
              className="flex flex-col  justify-start "
              onClick={() => {
                if (user.id !== currentUser.id) setUserId(user.id);
              }}
            >
              <div className="text-sm lg:text-base text-gray-800 dark:text-gray-200 font-semibold">
                {user.id === currentUser.id ? "You" : user.name}
              </div>
              <div className="text-xs text-blue-500 ">{user.username}</div>
            </div>
          </div>
        </th>
        {type === "Workspace" && (
          <td className="px-3 py-2 lg:py-3 lg:px-6">
            <div>
              On{" "}
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {user.projects}
              </span>{" "}
              {user.projects && user.projects > 1 ? "projects" : "project"}
            </div>
          </td>
        )}
        {(type === "Workspace" || type === "Project") && (
          <td className="px-3 py-2 lg:py-3 lg:px-6 text-nowrap">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {user.tasks}
              </span>{" "}
              {user.tasks && user.tasks > 1 ? "tasks" : "task"} assigned
            </div>
          </td>
        )}
        <td className="px-3 py-2 lg:py-3 lg:px-6 lg:text-base text-xs">
          {roleChange ? (
            <div className="relative lg:min-w-30 min-w-25 text-gray-700 dark:text-gray-300">
              <div
                className="border dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-20 lg:w-28 px-2 lg:px-3 py-0.5 flex items-center justify-between gap-1"
                onClick={() => {
                  if (changingRole) return;
                  setDropDown((prev) => !prev);
                }}
              >
                <div>{user.role}</div>
                <div>
                  <svg
                    className="w-4 h-4 text-gray-500 "
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
                className={`z-99 py-1  shadow-lg absolute top-0 -left-1 w-21 lg:w-30  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
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
        </td>
        <td className="px-3 py-2 lg:py-3 lg:px-6 lg:text-sm text-xs">
          {DateFormatter2(user.joinedAt)}
        </td>

        <td className=" py-2 lg:py-3 pr-4 pl-1 lg:text-base text-xs">
          {removePerm && (
            <div ref={optionsRef}>
              <div
                className="w-fit p-0.5 lg:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-blk7"
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
                userRole={user.role}
                projectPerms={project?.managerPerms ?? []}
                gap={
                  type === "Workspace"
                    ? "right-8 lg:right-12 xl:right-15 -top-6 lg:-top-8"
                    : type === "Project"
                      ? "right-10 lg:right-15 xl:right-20 -top-6 lg:-top-8"
                      : "right-15 lg:right-20 xl:right-25 -top-6 lg:-top-8"
                }
                color="bg-gray-200 dark:bg-blk4 "
                hover="hover:bg-gray-300 dark:hover:bg-blk6"
                projectRole={project?.role ?? undefined}
              ></RemoveDD>
            </div>
          )}
        </td>
      </tr>
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
