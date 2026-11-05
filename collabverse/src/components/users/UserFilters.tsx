"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  usersProjFilterProps,
  usersTaskFilterProps,
} from "../../app/interfaces";
import Image from "next/image";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useWsUserFilters } from "@/lib/queries/workspace/users/useWsUserFilters";
import { toast } from "sonner";
import Spinner1 from "../loadings/Spinner1";

interface props {
  selectedProject: usersProjFilterProps | null;
  setSelectedProject: Dispatch<SetStateAction<usersProjFilterProps | null>>;
  selectedTask: usersTaskFilterProps | null;
  setSelectedTask: Dispatch<SetStateAction<usersTaskFilterProps | null>>;
}
export default function UserFilters({
  selectedProject,
  setSelectedProject,
  selectedTask,
  setSelectedTask,
}: props) {
  const { data, isLoading, isError } = useWsUserFilters();
  const [taskData, setTaskData] = useState<usersTaskFilterProps[]>([]);
  const [showProject, setShowProject] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const projectRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  useClickOutSide([projectRef], () => setShowProject(false));
  useClickOutSide([taskRef], () => setShowTask(false));
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong");
    }
  }, [isError]);

  return (
    <div className="flex items-center gap-5">
      <div
        ref={projectRef}
        className={`relative lg:min-w-35 min-w-30 text-nowrap   ${
          (data?.length === 0 || isLoading) &&
          "cursor-not-allowed opacity-50 pointer-events-none"
        }`}
      >
        <div
          className={` text-black dark:text-gray-100  cursor-pointer justify-between flex gap-2 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1 `}
          onClick={() => {
            setShowProject((prev) => !prev);
            setShowTask(false);
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <Spinner1
                size="size-4 lg:size-5"
                fill="fill-gray-800 dark:fill-gray-200"
                color="text-gray-200 dark:text-blk3"
              ></Spinner1>
            </div>
          ) : (
            <>
              <div className="w-fit">
                {!selectedProject ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="lg:size-5 size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                ) : selectedProject.avatar ? (
                  <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md overflow-hidden">
                    <Image
                      alt={"ProjectAvatar"}
                      src={selectedProject.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className="w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md flex justify-center items-center"
                    style={{
                      background: gradientBgFromName(selectedProject.name),
                    }}
                  >
                    <div className="font-bold  text-xs text-white">
                      {getInitials(selectedProject.name)}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:text-sm text-xs ">
                {selectedProject ? selectedProject.name : `Select Project`}
              </div>
              <div className="text-gray-500 pr-1 ">
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
            </>
          )}
        </div>{" "}
        <div
          id="dropdown"
          className={`max-h-70 overflow-y-auto z-30 shadow-lg absolute top-11 lg:top-12 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200 divide-y transition-all duration-300 divide-gray-100 rounded-lg dark:bg-blk5 ${
            showProject
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-10 invisible pointer-events-none"
          }`}
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownDefaultButton"
          >
            {data?.map((pr: usersProjFilterProps) => {
              return (
                <li key={pr.id}>
                  {selectedProject?.id != pr.id ? (
                    <div
                      className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                      onClick={() => {
                        setSelectedProject(pr);
                        setTaskData(
                          data.find((p: usersProjFilterProps) => p.id === pr.id)
                            ?.tasks ?? [],
                        );
                        setSelectedTask(null);
                        setShowProject(false);
                      }}
                    >
                      <FlexBtwWrapper>
                        <div className="flex gap-2 items-center">
                          {pr.id === "0" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="lg:size-6 size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                              />
                            </svg>
                          ) : (
                            <div className="w-fit">
                              {pr.avatar ? (
                                <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md overflow-hidden">
                                  <Image
                                    alt={"activityAvatar"}
                                    src={pr.avatar}
                                    className="object-center"
                                    fill
                                  ></Image>
                                </div>
                              ) : (
                                <div
                                  className="w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md flex justify-center items-center"
                                  style={{
                                    background: gradientBgFromName(pr.name),
                                  }}
                                >
                                  <div className="font-bold text-[10px] text-white">
                                    {getInitials(pr.name)}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div>{pr.name}</div>
                        </div>
                      </FlexBtwWrapper>
                    </div>
                  ) : (
                    <></>
                  )}
                </li>
              );
            })}
            <li>
              {selectedProject && (
                <div
                  className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedTask(null);
                    setShowProject(false);
                  }}
                >
                  <FlexBtwWrapper>
                    <div className="flex gap-2 items-center">
                      <div>None</div>
                    </div>
                  </FlexBtwWrapper>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div
        ref={taskRef}
        className={`relative lg:min-w-35 min-w-30  text-nowrap ${
          !selectedProject?.id &&
          "opacity-50 select-none cursor-not-allowed pointer-events-none"
        }`}
      >
        <div
          className={` text-black dark:text-gray-100  cursor-pointer justify-between flex gap-2 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1 `}
          onClick={() => {
            setShowTask((prev) => !prev);
            setShowProject(false);
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <Spinner1
                size="size-4 lg:size-5"
                fill="fill-gray-800 dark:fill-gray-200"
                color="text-gray-200 dark:text-blk3"
              ></Spinner1>
            </div>
          ) : (
            <>
              {" "}
              <div className="w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="lg:size-5 size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </div>
              <div className="lg:text-sm text-xs  ">
                {selectedTask ? selectedTask.name : `Select Task`}
              </div>
              <div className="text-gray-500 pr-1 w-fit ">
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
            </>
          )}
        </div>
        <div
          id="dropdown"
          className={`max-h-70 max-w-50 overflow-y-auto z-30 shadow-lg absolute top-11 lg:top-12 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200 divide-y transition-all duration-300 divide-gray-100 rounded-lg dark:bg-blk5 ${
            showTask
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-10 invisible pointer-events-none"
          }`}
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownDefaultButton"
          >
            {taskData.map((t: usersTaskFilterProps) => {
              return (
                <li key={t.id}>
                  {selectedTask?.id != t.id && (
                    <div
                      className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                      onClick={() => {
                        setSelectedTask(t);
                        setShowTask(false);
                      }}
                    >
                      <FlexBtwWrapper>
                        <div className="flex gap-2 items-center">
                          <div>{t.name}</div>
                        </div>
                      </FlexBtwWrapper>
                    </div>
                  )}
                </li>
              );
            })}
            <li>
              {selectedTask && (
                <div
                  className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                  onClick={() => {
                    setSelectedTask(null);
                    setShowTask(false);
                  }}
                >
                  <FlexBtwWrapper>
                    <div className="flex gap-2 items-center">
                      <div>None</div>
                    </div>
                  </FlexBtwWrapper>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
