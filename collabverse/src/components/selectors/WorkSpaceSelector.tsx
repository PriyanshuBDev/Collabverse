"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { wsProps } from "@/app/interfaces";
import NewWsModal from "../btns/workspace/NewWsModal";
import { useWorkspaceSidebar } from "@/lib/queries/workspace/useWorkspaceSidebar";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useMounted from "@/lib/hooks/useMounted";
import { toast } from "sonner";
import useIsDark from "@/lib/hooks/useIsDark";
import WsSidebarSkeleton from "../skeletons/WorkspaceSidebarSkeleton";

export default function WorkSpaceSelector() {
  const { data, isError, isLoading } = useWorkspaceSidebar();
  const [dropDown, setDropDown] = useState(false);
  const mounted = useMounted();
  const isDark = useIsDark();
  const pathname = usePathname();
  const router = useRouter();
  const [showWsModal, setShowWsModal] = useState(false);
  const currentWsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutSide([currentWsRef, menuRef], () => setDropDown(false));

  const { slug, id, name } = useCurrentWorkspace();

  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong");
    }
  }, [isError]);
  if (!mounted) return null;

  const currentWs = data?.find((w: wsProps) => w.id === id);

  return (
    <>
      <div className="py-3 border-y-2 border-dashed border-gray-400 dark:border-gray-700 ">
        <div className="flex justify-between items-center w-full">
          <div
            className={`text-gray-500 text-sm font-semibold dark:text-gray-100 hover:underline cursor-pointer ${
              pathname === `/app/${slug}/workspaces` ? "underline" : ""
            }`}
            onClick={() => {
              router.push(`/app/${slug}/workspaces`);
            }}
          >
            WORKSPACES
          </div>
          <div
            className="cursor-pointer text-gray-700 dark:text-gray-400"
            onClick={() => setShowWsModal(true)}
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            )}
          </div>
        </div>
        {isLoading ? (
          <WsSidebarSkeleton />
        ) : (
          <div className="pt-3 relative">
            <div
              ref={currentWsRef}
              className="flex justify-center items-center gap-3 rounded-lg w-full p-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white cursor-pointer"
              onClick={() => setDropDown((prev) => !prev)}
            >
              <div className="shrink-0">
                {currentWs?.avatar ? (
                  <div className="relative w-8 h-8 lg:h-10 lg:w-10 rounded-lg overflow-hidden">
                    <Image
                      alt={"activityAvatar"}
                      src={currentWs.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={` w-8 h-8 lg:h-10 lg:w-10 rounded-lg  flex justify-center items-center  `}
                    style={{
                      background: gradientBgFromName(currentWs?.name ?? name),
                    }}
                  >
                    <div className="font-semibold text-base text-white ">
                      {getInitials(currentWs?.name ?? name)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between w-full min-w-0">
                <span className=" truncate">{currentWs?.name ?? name}</span>
                <span className="shrink-0  pr-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div
              ref={menuRef}
              className={`bg-gray-50 dark:bg-blk2 absolute top-18 left-0 rounded-lg w-full px-1 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out thinScrollbar ${
                dropDown
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-10 invisible"
              }`}
            >
              <ul className="py-2">
                {data?.map((w: wsProps) => {
                  return (
                    <li
                      key={w.id}
                      className="flex justify-center items-center gap-3 w-full cursor-pointer py-1.5 px-2 hover:bg-gray-200 dark:hover:bg-blk5 rounded-lg"
                      onClick={() => {
                        setDropDown(false);
                        if (w.id !== id) router.push(`/app/${w.slug}/home`);
                      }}
                    >
                      <div className="shrink-0">
                        {w.avatar ? (
                          <div className="relative w-8 h-8 lg:h-10 lg:w-10 rounded-lg overflow-hidden">
                            <Image
                              alt={"activityAvatar"}
                              src={w.avatar}
                              className="object-center object-cover"
                              fill
                            ></Image>
                          </div>
                        ) : (
                          <div
                            className={` w-8 h-8 lg:h-10 lg:w-10 rounded-lg  flex justify-center items-center  `}
                            style={{ background: gradientBgFromName(w.name) }}
                          >
                            <div className="font-semibold text-base text-white ">
                              {getInitials(w.name)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="dark:text-gray-100 truncate">
                          {w.name}
                        </span>
                        {id === w.id && (
                          <span className="shrink-0 text-gray-500 pr-1 ">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="size-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
      {createPortal(
        <NewWsModal show={showWsModal} setShow={setShowWsModal} />,
        document.body,
      )}
    </>
  );
}
