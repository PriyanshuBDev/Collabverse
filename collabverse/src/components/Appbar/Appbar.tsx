"use client";

import ThemeToggler from "./ThemeToggler";
import SearchBar from "./SearchBar";
import { useRef, useState } from "react";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import LogOutWarning from "../warnings/LogOutWarning";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";
import useMounted from "@/lib/hooks/useMounted";
import Spinner1 from "../loadings/Spinner1";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useIsDark from "@/lib/hooks/useIsDark";
import { useNotificationCount } from "@/lib/queries/user/notifications.ts/useNotificationCount";
import { LeaveSvg } from "../svg/LeaveSvg";

interface props {
  onClick: () => void;
  isOpen: boolean;
}

export default function Appbar({ onClick, isOpen }: props) {
  const { user, toggleMute, isToggling } = useUserAppbar();
  const mounted = useMounted();
  const [showMute, setShowMute] = useState(false);
  const [logOutWarning, setLogOutWarning] = useState(false);
  const { data } = useNotificationCount();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isDark = useIsDark();
  useClickOutSide([menuRef], () => setShowMute(false));
  const { slug } = useCurrentWorkspace();

  if (!mounted) return null;

  return (
    <>
      <div
        className={`px-5 py-2 fixed flex items-center gap-5 top-0 left-0 right-0 z-100 h-15 transition-all duration-300 dark:bg-blk2 bg-gray-50 border-b-2 dark:border-gray-700 border-gray-200 ${
          isOpen ? "md:ml-65" : ""
        }`}
      >
        {!isOpen && (
          <div
            className="dark:text-gray-400 text-black cursor-pointer"
            onClick={onClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </div>
        )}
        <SearchBar></SearchBar>
        <div className="w-full flex justify-end items-center gap-2 lg:gap-5">
          <ThemeToggler />
          {showMute && <div className="inset-0 fixed bg-transparent z-100" />}
          <div ref={menuRef} className=" relative ">
            <div
              className="text-black dark:text-gray-400 cursor-pointer"
              onClick={() => router.push(`/app/${slug}/notifications`)}
              onContextMenu={(
                e: React.MouseEvent<HTMLDivElement, MouseEvent>,
              ) => {
                e.preventDefault();
                setShowMute((prev) => !prev);
              }}
            >
              {user?.mute ? (
                isDark ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.57 16.476c-.223.082-.448.161-.674.238L7.319 4.137A6.75 6.75 0 0 1 18.75 9v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206Z" />
                    <path
                      fillRule="evenodd"
                      d="M5.25 9c0-.184.007-.366.022-.546l10.384 10.384a3.751 3.751 0 0 1-7.396-1.119 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
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
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
                    />
                  </svg>
                )
              ) : isDark ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
                  <path
                    fillRule="evenodd"
                    d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z"
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
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
                  />
                </svg>
              )}
            </div>
            {!!data && data > 0 && (
              <div className="absolute pointer-events-none -top-0.5 lg:-top-1  right-0  bg-red-500 rounded-full px-1 py-[1px] border-2 border-gray-50 dark:border-blk2 text-white text-[8px]">
                {data > 99 ? "99+" : data}
              </div>
            )}
            <div
              className={`absolute z-101 top-8 left-1/2 -translate-x-1/2 p-1 rounded-lg bg-gray-200 dark:bg-blk3 transition-all duration-300 ${
                showMute
                  ? "visible opacity-100 pointer-events-auto"
                  : "invisible opacity-0 pointer-events-none"
              }`}
              onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                e.stopPropagation()
              }
            >
              <button
                disabled={isToggling}
                className="disabled:cursor-not-allowed hover:bg-gray-100 hover:dark:bg-blk5 flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-sm lg:text-base text-gray-800 dark:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMute(false);
                  toggleMute();
                }}
              >
                <span>
                  {user?.mute ? (
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
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
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
                        d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
                      />
                    </svg>
                  )}
                </span>
                {user?.mute ? "Ring" : "Silent"}
              </button>
            </div>
          </div>
          <div
            className="w-fit"
            onClick={() => router.push(`/app/${slug}/profile`)}
          >
            {user ? (
              user.avatar ? (
                <div className="relative w-7 h-7 lg:h-8 lg:w-8 rounded-md overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                  <Image
                    alt={"UserAvatar"}
                    src={user.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-7 h-7 lg:h-8 lg:w-8 rounded-sm lg:rounded-md flex justify-center items-center cursor-pointer `}
                  style={{ background: gradientBgFromName(user.name) }}
                >
                  <div className="font-semibold text-sm text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
              )
            ) : (
              <div
                className={`w-7 h-7 lg:h-8 lg:w-8 rounded-sm lg:rounded-md flex justify-center items-center cursor-pointer bg-gray-100 dark:bg-blk4`}
              >
                <Spinner1
                  size="size-4"
                  fill="fill-gray-600 dark:fill-gray-300"
                  color="text-gray-100 dark:text-blk4"
                ></Spinner1>
              </div>
            )}
          </div>
          <button
            type="button"
            className="cursor-pointer text-white h-fit text-nowrap bg-gradient-to-r from-emerald-500 to-emerald-700 hover:bg-gradient-to-bl font-medium rounded-sm lg:rounded-lg text-sm px-1.5 lg:px-5 py-1 lg:py-2 text-center"
            onClick={() => {
              setLogOutWarning(true);
            }}
          >
            <span className="lg:hidden">
              <LeaveSvg />
            </span>
            <div className="lg:block hidden ">Log Out</div>
          </button>
        </div>
      </div>
      {mounted &&
        createPortal(
          <LogOutWarning
            showWarning={logOutWarning}
            setShowWarning={setLogOutWarning}
          />,
          document.body,
        )}
    </>
  );
}
