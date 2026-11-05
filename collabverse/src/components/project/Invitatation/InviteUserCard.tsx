import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { PRole } from "@prisma/client";
import {
  memberProps,
  projectAuthorityRole,
  projectInviteUserProps,
} from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { projectRoleChange } from "@/lib/axios/workspace/project/users/roleChangeProjectUser";

export default function InviteUserCard({
  user,
  setMembers,
  members,
  currentUserRole,
}: {
  user: memberProps;
  setMembers: Dispatch<SetStateAction<projectInviteUserProps[]>>;
  members: projectInviteUserProps[];
  currentUserRole: projectAuthorityRole;
}) {
  const { id } = useCurrentUser();
  const [dropdown, setDropDown] = useState(false);
  const roles: projectRoleChange[] = [PRole.Viewer];
  if (currentUserRole === "High" || currentUserRole === "Owner") {
    roles.push(PRole.Contributor);
    roles.push(PRole.Manager);
  }
  if (currentUserRole === "Manager") {
    roles.push(PRole.Contributor);
  }
  const [selectedRole, setSelectedRole] = useState<projectRoleChange>(
    PRole.Viewer,
  );
  const [present, setPresent] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleAdding = () => {
    const members: projectInviteUserProps = { id: user.id, role: selectedRole };
    setMembers((prev) => [...prev, members]);
  };
  const handleRemoving = () => {
    setMembers((prev) =>
      prev.filter((p: projectInviteUserProps) => p.id !== user.id),
    );
  };
  useEffect(() => {
    const userExist = members.find(
      (a: projectInviteUserProps) => a.id === user.id,
    );
    if (userExist) {
      setSelectedRole(userExist.role);
      setPresent(true);
    } else {
      setPresent(false);
    }
  }, [members, user.id]);
  useClickOutSide([dropRef], () => setDropDown(false));
  return (
    <div
      className={`hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg active:scale-98 transition-transform duration-150 ${
        present ? "bg-gray-200 dark:bg-blk8" : ""
      }`}
      onClick={() => {
        if (present) {
          handleRemoving();
        } else {
          handleAdding();
        }
      }}
    >
      <FlexBtwWrapper addOns="gap-3 ">
        <div className="flex items-center gap-2">
          {user.avatar ? (
            <div className="relative w-7 h-7 lg:h-7 lg:w-7 rounded-sm overflow-hidden ">
              <Image
                alt={"AssigneeAvatar"}
                src={user.avatar}
                className="object-center object-cover"
                fill
              ></Image>
            </div>
          ) : (
            <div
              className={`w-7 h-7 lg:h-7 lg:w-7 rounded-sm flex justify-center items-center `}
              style={{ background: gradientBgFromName(user.name) }}
            >
              <div className="font-semibold text-xs text-white">
                {getInitials(user.name)}
              </div>
            </div>
          )}
          <div className="flex flex-col  ">
            <div className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
              {user.id === id ? "You" : user.name}
            </div>
            <div className="text-xs text-blue-500">{user.username}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            ref={dropRef}
            className="relative lg:min-w-30 min-w-25 cursor-pointer"
          >
            <div
              className="border dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-23 lg:w-30 px-2 lg:px-3 py-0.5 flex items-center justify-between gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setDropDown((prev) => !prev);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="text-xs lg:text-sm">{selectedRole}</div>
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
            <div
              id="dropdown"
              className={`z-30 py-1  shadow-lg absolute top-0 -left-1 w-23 lg:w-32  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
                dropdown
                  ? "opacity-100 visible"
                  : "opacity-0 invisible pointer-events-none"
              }`}
            >
              {roles.map((r: projectRoleChange, idx: number) => (
                <div
                  className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
                    r === selectedRole && "border-l-4 border-blue-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRole(r);
                    setDropDown(false);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  key={idx}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          <label
            className="relative flex items-center cursor-pointer pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={present}
              className="peer pointer-events-none appearance-none  h-5 w-5 border-2 border-gray-500  rounded-md checked:bg-blue-600 transition-all duration-300 cursor-pointer"
              readOnly
              onClick={(e) => e.stopPropagation()}
            />
            <svg
              className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              {" "}
              <path d="M5 13l4 4L19 7" />
            </svg>
          </label>
        </div>
      </FlexBtwWrapper>
    </div>
  );
}
