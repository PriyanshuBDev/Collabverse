import { basicMember, taskFilterProjectProps } from "@/app/interfaces";
import Spinner1 from "@/components/loadings/Spinner1";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useTaskUserFilter } from "@/lib/queries/workspace/project/task/view/useTaskUserFilter";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AssignedToFilter({
  selectedProject,
  assignedTo,
  setAssignedTo,
}: {
  selectedProject: taskFilterProjectProps;
  assignedTo: basicMember | undefined;
  setAssignedTo: Dispatch<SetStateAction<basicMember | undefined>>;
}) {
  const { data, isLoading, isError } = useTaskUserFilter(selectedProject.id);
  const [showAssignedTo, setShowAssignedTo] = useState(false);
  const assignedToRef = useRef<HTMLDivElement>(null);
  useClickOutSide([assignedToRef], () => setShowAssignedTo(false));
  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch Assigned To filter");
    }
  }, [isError]);

  return (
    <div
      ref={assignedToRef}
      className={`relative lg:min-w-35 min-w-30 text-nowrap   ${
        (data?.length === 0 || isLoading) &&
        "cursor-not-allowed opacity-50 pointer-events-none"
      }`}
    >
      <div
        className={` text-black dark:text-gray-100  cursor-pointer justify-between flex gap-2 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1 `}
        onClick={() => {
          setShowAssignedTo((prev) => !prev);
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
              {!assignedTo ? (
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              ) : assignedTo.avatar ? (
                <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md overflow-hidden">
                  <Image
                    alt={"UserAvatar"}
                    src={assignedTo.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className="w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md flex justify-center items-center"
                  style={{
                    background: gradientBgFromName(assignedTo.name),
                  }}
                >
                  <div className="font-bold  text-xs text-white">
                    {getInitials(assignedTo.name)}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:text-sm text-xs ">
              {assignedTo ? assignedTo.name : `Assigned To`}
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
          showAssignedTo
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {data?.map((u: basicMember) => {
            return (
              <li key={u.id}>
                {assignedTo?.id != u.id ? (
                  <div
                    className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                    onClick={() => {
                      setAssignedTo(u);

                      setShowAssignedTo(false);
                    }}
                  >
                    <FlexBtwWrapper>
                      <div className="flex gap-2 items-center">
                        {u.id === "0" ? (
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
                            {u.avatar ? (
                              <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md overflow-hidden">
                                <Image
                                  alt={"UserAvatar"}
                                  src={u.avatar}
                                  className="object-center"
                                  fill
                                ></Image>
                              </div>
                            ) : (
                              <div
                                className="w-4 h-4 lg:h-5 lg:w-5 rounded-sm lg:rounded-md flex justify-center items-center"
                                style={{
                                  background: gradientBgFromName(u.name),
                                }}
                              >
                                <div className="font-bold text-[10px] text-white">
                                  {getInitials(u.name)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div>{u.name}</div>
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
            {assignedTo && (
              <div
                className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                onClick={() => {
                  setAssignedTo(undefined);
                  setShowAssignedTo(false);
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
