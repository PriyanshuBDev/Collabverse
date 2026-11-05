"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { toast } from "sonner";
import { usersTaskFilterProps } from "@/app/interfaces";
import { useProjectUserFilters } from "@/lib/queries/workspace/project/users/useProjectUserFilters";
import Spinner1 from "@/components/loadings/Spinner1";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

interface props {
  selectedTask: usersTaskFilterProps | undefined;
  setSelectedTask: Dispatch<SetStateAction<usersTaskFilterProps | undefined>>;
}
export default function ProjectUserFilters({
  selectedTask,
  setSelectedTask,
}: props) {
  const { data, isLoading, isError } = useProjectUserFilters();
  const [showTask, setShowTask] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  useClickOutSide([taskRef], () => setShowTask(false));
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong");
    }
  }, [isError]);
  return (
    <div
      ref={taskRef}
      className={`relative lg:min-w-35 min-w-30  text-nowrap ${
        (!data || data.length === 0) &&
        "opacity-50 select-none cursor-not-allowed pointer-events-none"
      }`}
    >
      <div
        className={` text-black dark:text-gray-100  cursor-pointer justify-between flex gap-2 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1 `}
        onClick={() => {
          setShowTask((prev) => !prev);
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
          {data?.map((t: usersTaskFilterProps) => {
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
                  setSelectedTask(undefined);
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
  );
}
