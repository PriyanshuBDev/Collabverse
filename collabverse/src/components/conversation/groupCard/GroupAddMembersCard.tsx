import { groupUsersProps, memberProps } from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export default function GroupAddMembersCard({
  m,
  setSelectedMembers,
  selectedMembers,
}: {
  m: memberProps;
  setSelectedMembers: Dispatch<SetStateAction<groupUsersProps[]>>;
  selectedMembers: groupUsersProps[];
}) {
  const selected = !!selectedMembers.find(
    (s: groupUsersProps) => s.id === m.id,
  );
  return (
    <div
      key={m.id}
      className={`hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg active:scale-98 transition-transform duration-150 ${
        selected ? "bg-gray-200 dark:bg-blk8" : ""
      }`}
      onClick={() => {
        setSelectedMembers(
          selected
            ? (prev) => prev.filter((p: groupUsersProps) => p.id !== m.id)
            : (prev) => [...prev, { ...m, role: "Member" }],
        );
      }}
    >
      <FlexBtwWrapper>
        <div className="flex items-center gap-2 ">
          <div className="w-fit ">
            {m.avatar ? (
              <div
                className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                onClick={() => {}}
              >
                <Image
                  alt={"projectAvatar"}
                  src={m.avatar}
                  className="object-center"
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
              {m.name}
            </div>

            <div className="text-xs text-blue-500">{m.username}</div>
          </div>
        </div>
        <label
          className="relative flex items-center cursor-pointer pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
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
      </FlexBtwWrapper>
    </div>
  );
}
