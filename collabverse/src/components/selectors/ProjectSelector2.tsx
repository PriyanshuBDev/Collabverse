"use client";

import { projectProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import Image from "next/image";
import { useRef, useState } from "react";

export default function ProjectSelector2() {
  const [dropDown, setDropDown] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([dropRef], () => setDropDown(false));
  const projects: projectProps[] = [
    {
      id: "1",
      avatar: "https://picsum.photos/200",
      name: "UI/Uxdfsdfgsdfgsdfgsdfg",
      slug: "uiux",
    },
    { id: "2", name: "Web Dev", slug: "uiux" },
    {
      id: "3",
      avatar: "https://picsum.photos/200",
      name: "DevOps",
      slug: "uiux",
    },
  ];
  const [project, setProject] = useState<projectProps>(projects[0]);

  return (
    <div ref={dropRef} className=" relative w-50">
      <div
        className="flex justify-center items-center gap-3 bg-gray-200 rounded-lg w-full p-2 dark:bg-blk5 cursor-pointer"
        onClick={() => setDropDown((prev) => !prev)}
      >
        <div className="shrink-0">
          {project.avatar ? (
            <div className="relative w-6 h-6 lg:h-8 lg:w-8 lg:rounded-lg rounded-md overflow-hidden">
              <Image
                alt={"activityAvatar"}
                src={project.avatar}
                className="object-center"
                fill
              ></Image>
            </div>
          ) : (
            <div
              className="w-6 h-6 lg:h-8 lg:w-8 lg:rounded-lg rounded-md flex justify-center items-center "
              style={{ background: gradientBgFromName(project.name) }}
            >
              <div className="font-semibold  lg:text-sm text-xs text-white">
                {getInitials(project.name)}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between w-full min-w-0">
          <span className="dark:text-gray-100 truncate">{project.name}</span>
          <div className="shrink-0 text-gray-500 pr-1 ">
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
          </div>
        </div>
      </div>

      <div
        className={`bg-gray-200  dark:bg-blk5 absolute top-13 left-0 right-0 rounded-lg px-2 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out z-10 ${
          dropDown
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible"
        }`}
      >
        <ul className="pt-3">
          {projects.map((p: projectProps, idx: number) => {
            return (
              <li
                key={idx}
                className="flex justify-center items-center gap-3 w-full cursor-pointer mb-3"
                onClick={() => {
                  setProject(p);
                  setDropDown(false);
                }}
              >
                <div className="shrink-0">
                  {p.avatar ? (
                    <div className="relative w-6 h-6 lg:h-8 lg:w-8 lg:rounded-lg rounded-md overflow-hidden">
                      <Image
                        alt={"activityAvatar"}
                        src={p.avatar}
                        className="object-center"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={` w-6 h-6 lg:h-8 lg:w-8 lg:rounded-lg rounded-md  flex justify-center items-center  `}
                      style={{ background: gradientBgFromName(p.name) }}
                    >
                      <div className="font-semibold  lg:text-sm text-xs text-white ">
                        {getInitials(p.name)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="dark:text-gray-100 truncate">{p.name}</span>
                  {project.name === p.name && (
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
  );
}
