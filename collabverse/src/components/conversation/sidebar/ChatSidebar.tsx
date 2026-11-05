"use client";

import { useEffect, useRef, useState } from "react";
import NewChatBtn from "./NewChatBtn";
import ChatList from "./ChatList";
import Searchbar from "@/components/project/Overview/Searchbar";

export default function ChatSidebar() {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLElement>(null);
  // const [width, setWidth] = useState("80px");
  const [mounted, setMounted] = useState(false);
  const [openSideBar, setOpenSideBar] = useState<boolean | null>(null); // null until initialized
  const prevWidth = useRef<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  // Initialize client state
  useEffect(() => {
    const saved = localStorage.getItem("ChatSideBar");
    const initialState = saved ? saved === "open" : window.innerWidth >= 1024;
    setOpenSideBar(initialState);

    const handleResize = () => {
      const width = window.innerWidth;
      const crossedToMobile = prevWidth.current >= 1024 && width < 1024;
      const crossedToDesktop = prevWidth.current < 1024 && width >= 1024;

      if (crossedToMobile) setOpenSideBar(false);
      if (crossedToDesktop) {
        const saved = localStorage.getItem("ChatSideBar");
        const savedState = saved === "open";
        setOpenSideBar(savedState);
      }

      prevWidth.current = width;
    };

    window.addEventListener("resize", handleResize);
    setTimeout(() => setMounted(true), 50);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update <main> margin dynamically
  useEffect(() => {
    if (!mounted || openSideBar === null) return; // not initialized yet
    const main = document.getElementById("chat-main");
    if (main) {
      setTimeout(() => {
        main.setAttribute("chat-mounted", "true");
        main.setAttribute("chat-sidebar-open", openSideBar ? "true" : "false");
      }, 50);
    }
  }, [openSideBar, mounted]);
  // useEffect(() => {
  //   if (ref.current) {
  //     if (openSideBar) {
  //       setWidth("340px"); // expand smoothly
  //     } else {
  //       setWidth("80px"); // collapse smoothly
  //     }
  //   }
  // }, [openSideBar]);
  if (openSideBar === null) return null;
  if (!mounted) return null;
  return (
    <>
      <aside
        ref={ref}
        className={`flex flex-col fixed top-0 bottom-0  mt-15 border-r-2 border-gray-200 dark:border-gray-700 dark:bg-blk1 bg-gray-100 text-gray-900 dark:text-gray-100 z-39 transform transition-transform duration-300 
       `}
        id="chat-sidebar"
        chat-side="false"
        style={{
          width: openSideBar ? "340px" : "80px",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          className={`flex justify-between items-center w-full h-15 px-3 pt-2 ${
            openSideBar ? "" : "pl-7"
          }`}
        >
          {openSideBar && (
            <Searchbar
              setSearch={setSearch}
              search={search}
              placeholder="Search chats"
              width="max-w-60 w-full"
              round="rounded-full"
            />
          )}
          {openSideBar && <NewChatBtn />}
          {openSideBar ? (
            <div
              className="text-gray-500  cursor-pointer"
              onClick={() => {
                setOpenSideBar(false);
                localStorage.setItem("ChatSideBar", "close");
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
                  d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
                />
              </svg>
            </div>
          ) : (
            <div
              className=" text-gray-500 cursor-pointer my-0.5 "
              onClick={() => {
                setOpenSideBar(true);
                localStorage.setItem("ChatSideBar", "open");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 lg:size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="mt-3 h-full">
          {<ChatList open={openSideBar} search={search} />}
        </div>
      </aside>
    </>
  );
}
