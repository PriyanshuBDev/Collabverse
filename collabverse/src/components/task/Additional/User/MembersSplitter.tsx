"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { taskMembersProps } from "../../../../app/interfaces";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";

export default function MembersSplitter({
  role,
  users,
}: {
  role: string;
  users: taskMembersProps[];
}) {
  const [showUsers, setShowUsers] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [height, setHeight] = useState("auto");
  const filteredUsers = users.filter((u: taskMembersProps) => u.role === role);
  useLayoutEffect(() => {
    if (!ref.current) return;

    // FIRST RENDER → DO NOT ANIMATE
    if (isFirstRender.current) {
      setHeight("auto");
      isFirstRender.current = false;
      return;
    }

    // AFTER FIRST RENDER → ANIMATE
    if (showUsers) {
      setHeight(ref.current.scrollHeight + "px");
    } else {
      setHeight("0px");
    }
  }, [showUsers, filteredUsers]);

  return (
    <div className="flex flex-col my-2">
      <div className="flex gap-2 text-gray-600 dark:text-gray-400 font-semibold text-[9px] lg:text-sm">
        <div
          className="cursor-pointer"
          onClick={() => {
            setShowUsers((prev) => !prev);
          }}
        >
          <svg
            className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 text-gray-400 ${
              showUsers ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>{role}s</div>
        <div className="lg:w-6 lg:h-6 w-4 h-4 flex items-center justify-center text-[9px] lg:text-sm rounded-full bg-gray-100 dark:bg-blk5 text-gray-500">
          {filteredUsers.length}
        </div>
      </div>
      <div
        ref={ref}
        className="overflow-hidden"
        style={{
          maxHeight: height,
          opacity: showUsers ? 1 : 0,
          transform: showUsers
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.98)",
          transition: isFirstRender.current ? "nonw" : "all 0.3s ease",
        }}
      >
        <div className="flex flex-wrap items-center gap-2 px-5 mt-1">
          {filteredUsers.map((m: taskMembersProps, idx: number) => {
            return (
              <div key={idx} className={`  transition-all `}>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border rounded-md px-2 py-0.5 border-gray-400 dark:border-gray-700 w-fit">
                  {m.avatar ? (
                    <div className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                      <Image
                        alt={"MembersAvatar"}
                        src={m.avatar}
                        className="object-center"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center border-2 border-white dark:border-blk5`}
                      style={{ background: gradientBgFromName(m.name) }}
                    >
                      <div className="font-semibold text-xs text-white">
                        {getInitials(m.name)}
                      </div>
                    </div>
                  )}
                  <div className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm text-nowrap">
                    {m.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
