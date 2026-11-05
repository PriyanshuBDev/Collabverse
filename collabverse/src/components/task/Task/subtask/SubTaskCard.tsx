"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { subTaskProps } from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import Toolbar from "@/components/helpers/Toolbar";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import EditSubtask from "./EditSubtask";
import { usePatchSubtask } from "@/lib/queries/workspace/project/task/subtask/usePatchSubtask";
import { PencilSvgLight } from "@/components/svg/PencilSvg";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

interface stProps {
  showSubTask: string[];
  setShowSubTask: Dispatch<SetStateAction<string[]>>;
  subtask: subTaskProps;
  canEdit: boolean;
}
export default function SubTaskCard({
  showSubTask,
  setShowSubTask,
  subtask,
  canEdit,
}: stProps) {
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const { mark, deleteMutation } = usePatchSubtask(subtask.id);
  const show = showSubTask.includes(subtask.id);
  const [subTaskWarning, setSubTaskWarning] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (ref.current) {
      if (show) {
        const scrollHeight = ref.current.scrollHeight;
        setHeight(scrollHeight + "px"); // expand smoothly
      } else {
        setHeight("0px"); // collapse smoothly
      }
    }
  }, [show, subtask.description, readMore]);
  return (
    <div>
      <FlexBtwWrapper>
        <div key={subtask.id} className="flex items-center gap-1">
          <div
            className="cursor-pointer text-gray-600 dark:text-gray-400"
            onClick={() =>
              setShowSubTask((prev: string[]) =>
                prev.includes(subtask.id)
                  ? prev.filter((i: string) => i !== subtask.id)
                  : [...prev, subtask.id],
              )
            }
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 text-gray-400 ${
                show ? "rotate-180" : "rotate-0"
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
          <label className="relative flex items-center cursor-pointer ">
            <input
              disabled={!canEdit || mark.isPending}
              type="checkbox"
              checked={subtask.done}
              className="peer appearance-none  h-5 w-5 border-2 border-gray-500  rounded-md checked:bg-blue-600 transition-all duration-300"
              onChange={(e) => {
                mark.mutate({ done: e.target.checked });
              }}
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

            <span
              className={`ml-2  font-semibold text-xs lg:text-sm  text-gray-900 dark:text-gray-200 ${
                subtask.done && "line-through"
              }`}
            >
              {subtask.name}
            </span>
          </label>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              className={` cursor-pointer text-gray-500 text-xs lg:text-sm font-semibold relative group `}
              onClick={() => {
                setSubTaskWarning(true);
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
                  d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <Toolbar top="-top-7">Delete</Toolbar>
            </button>
            <button
              className={` cursor-pointer text-gray-700 dark:text-gray-400 text-xs lg:text-sm font-semibold relative group p-1 rounded-full border-2 border-gray-500  `}
              onClick={() => {
                setShowEdit(true);
              }}
            >
              <PencilSvgLight size="size-2 lg:size-3" />

              <Toolbar top="-top-8">Edit</Toolbar>
            </button>
          </div>
        )}
      </FlexBtwWrapper>
      <OverlayWrapper active={subTaskWarning}>
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md">
          Are you sure about deleting subtask :{" "}
          <span className="text-black dark:text-white font-semibold mx-1">
            &quot;{subtask.name}&quot;
          </span>
          ?
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
          <button
            className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
            onClick={() => setSubTaskWarning(false)}
          >
            cancel
          </button>
          <button
            className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
            onClick={() => {
              deleteMutation.mutate();
              setSubTaskWarning(false);
            }}
          >
            Delete
          </button>
        </div>
      </OverlayWrapper>
      <EditSubtask
        id={subtask.id}
        name={subtask.name}
        description={subtask.description}
        setActive={setShowEdit}
        active={showEdit}
      />

      <div
        ref={ref}
        style={{
          maxHeight: height,
          opacity: show ? 1 : 0,
          transform: show
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.98)",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          className={`mx-2 lg:mx-4 mt-2 lg:mt-3 p-3 rounded-lg bg-gray-100 dark:bg-blk4 text-gray-600 dark:text-gray-400 text-xs md:text-base cursor-pointer break-words overflow-wrap-anywhere  transition-all duration-300 `}
        >
          <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">
            {DateFormatter3(subtask.createdAt)}
          </div>

          <div className="rounded-lg flex flex-col gap-2 bg-gray-50 dark:bg-blk5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs md:text-base cursor-pointer break-words overflow-wrap-anywhere p-3">
            {subtask.done && subtask.markedBy && (
              <div>
                {" "}
                <div className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                  Marked By:
                </div>
                <div className={`mt-1 flex items-center gap-1`}>
                  <div
                    className="w-fit cursor-pointer"
                    onClick={() => {
                      if (
                        subtask.markedBy &&
                        subtask.markedBy.id &&
                        subtask.markedBy.id !== currentUserId
                      ) {
                        setUserId(subtask.markedBy.id);
                      }
                    }}
                  >
                    {subtask.markedBy.avatar ? (
                      <div
                        className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                        onClick={() => {}}
                      >
                        <Image
                          alt={"UserAvatar"}
                          src={subtask.markedBy.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center cursor-pointer `}
                        style={{
                          background: gradientBgFromName(subtask.markedBy.name),
                        }}
                        onClick={() => {}}
                      >
                        <div className="font-semibold text-xs text-white">
                          {getInitials(subtask.markedBy.name)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="text-gray-800 dark:text-gray-200 text-xs md:text-sm font-semibold cursor-pointer hover:underline"
                    onClick={() => {
                      if (
                        subtask.markedBy &&
                        subtask.markedBy.id &&
                        subtask.markedBy.id !== currentUserId
                      ) {
                        setUserId(subtask.markedBy.id);
                      }
                    }}
                  >
                    {subtask.markedBy.name}
                  </div>
                </div>
              </div>
            )}
            <div className="text-gray-800 dark:text-gray-300 text-xs md:text-sm">
              Created By:
            </div>
            <div className={`mt-1 flex items-center gap-1`}>
              <div
                className="w-fit cursor-pointer"
                onClick={() => {
                  if (
                    subtask.createdBy.id &&
                    subtask.createdBy.id !== currentUserId
                  ) {
                    setUserId(subtask.createdBy.id);
                  }
                }}
              >
                {subtask.createdBy.avatar ? (
                  <div
                    className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"UserAvatar"}
                      src={subtask.createdBy.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center cursor-pointer `}
                    style={{
                      background: gradientBgFromName(subtask.createdBy.name),
                    }}
                    onClick={() => {}}
                  >
                    <div className="font-semibold text-xs text-white">
                      {getInitials(subtask.createdBy.name)}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="text-gray-800 dark:text-gray-200 text-xs md:text-sm font-semibold cursor-pointer hover:underline"
                onClick={() => {
                  if (
                    subtask.createdBy.id &&
                    subtask.createdBy.id !== currentUserId
                  ) {
                    setUserId(subtask.createdBy.id);
                  }
                }}
              >
                {subtask.createdBy.name}
              </div>
            </div>

            {subtask.description && (
              <>
                <div className="text-gray-800 dark:text-gray-300 text-xs md:text-sm">
                  Description:
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  {subtask.description.length > 200 ? (
                    <div>
                      {readMore
                        ? subtask.description
                        : `${subtask.description.slice(0, 200)}...`}
                      <div
                        className="flex justify-end hover:underline "
                        onClick={() => {
                          setReadMore((prev) => !prev);
                        }}
                      >
                        {readMore ? "Read Less" : "Read More"}
                      </div>
                    </div>
                  ) : (
                    subtask.description
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
