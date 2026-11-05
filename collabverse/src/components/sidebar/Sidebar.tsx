"use client";

import Image from "next/image";
import DashboardBtns from "../btns/sidebar/DashboardBtns";
import ProjectSelector from "../selectors/ProjectSelector";
import WorkSpaceSelector from "../selectors/WorkSpaceSelector";

interface props {
  onClick: () => void;
  open: boolean;
}

export default function Sidebar({ onClick, open }: props) {
  return (
    <>
      <aside
        className={`flex flex-col fixed top-0 left-0 bottom-0 h-screen w-65 px-3 dark:bg-blk bg-gray-200 text-gray-900 dark:text-gray-100 z-101 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center w-full h-15">
          <div className="flex items-center gap-2">
            <Image
              src="/collabverseLogo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold tracking-tight">
              Collab<span className="text-emerald-400">Verse</span>
            </span>
          </div>
          <div
            className="text-black dark:text-gray-400 cursor-pointer"
            onClick={onClick}
          >
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
                d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
              />
            </svg>
          </div>
        </div>

        <WorkSpaceSelector />

        <DashboardBtns />

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
          <ProjectSelector />
        </div>
      </aside>

      {/* overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClick}
        />
      )}
    </>
  );
}
