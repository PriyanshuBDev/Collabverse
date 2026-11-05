import Image from "next/image";
import colorFromName from "@/lib/functions/colors/colorFromName";
import getInitials from "@/lib/functions/user/getInitials";
import FlexBtwWrapper from "../../../wrappers/FlexBtwWrapper";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { memberProps, taskMembersProps } from "../../../../app/interfaces";
import { TaskRole } from "@prisma/client";

export default function SearchUserCard({
  user,
  setAssignee,
  assignee,
}: {
  user: memberProps;
  setAssignee: Dispatch<SetStateAction<taskMembersProps[]>>;
  assignee: taskMembersProps[];
}) {
  const [dropdown, setDropDown] = useState(false);
  const roles: TaskRole[] = ["Assignee", "Reviewer"];
  const [selectedRole, setSelectedRole] = useState<TaskRole>(roles[0]);
  const [present, setPresent] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleAdding = () => {
    const assignee: taskMembersProps = { ...user, role: selectedRole };
    setAssignee((prev) => [...prev, assignee]);
  };
  useEffect(() => {
    const userExist = assignee.find((a: taskMembersProps) => a.id === user.id);
    if (userExist) {
      setSelectedRole(userExist.role);
      setPresent(true);
    }
  }, [assignee, user.id]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropDown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <FlexBtwWrapper addOns="mt-2 gap-1 px-3 py-1 ">
      <div className="flex items-center gap-2">
        {user.avatar ? (
          <div className="relative w-7 h-7 lg:h-7 lg:w-7 rounded-sm overflow-hidden ">
            <Image
              alt={"AssigneeAvatar"}
              src={user.avatar}
              className="object-center"
              fill
            ></Image>
          </div>
        ) : (
          <div
            className={`w-7 h-7 lg:h-7 lg:w-7 rounded-sm flex justify-center items-center ${colorFromName(
              user.name,
            )} `}
          >
            <div className="font-semibold text-xs text-white">
              {getInitials(user.name)}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center ">
          <div className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
            {user.name}
          </div>
          <div className="text-xs text-blue-500">{user.username}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {present ? (
          <div className="text-black dark:text-gray-100 font-semibold  text-xs lg:px-2 px-1 lg:py-1.5 py-1">
            {selectedRole}
          </div>
        ) : (
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
              {roles.map((r: TaskRole, idx: number) => (
                <div
                  className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
                    r === selectedRole && "border-l-4 border-blue-500"
                  }`}
                  onClick={() => {
                    setSelectedRole(r);
                    setDropDown(false);
                  }}
                  key={idx}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          className={` relative w-full ${
            present ? "" : "cursor-pointer group"
          }`}
          onClick={() => {
            if (!present) {
              handleAdding();
            }
          }}
        >
          {!present ? (
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          ) : (
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
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}

          <div className="transition-all duration-300 cursor-pointer text-xs absolute -top-6 left-1/2 -translate-x-1/2 w-max min-w-full px-2 lg:px-2.5 py-1 rounded-md group-hover:visible group-hover:opacity-90 invisible opacity-0 pointer-events-none bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-800">
            Add
          </div>
        </div>
      </div>
    </FlexBtwWrapper>
  );
}
