"use client";

import {
  basicMember,
  projectAuthorityRole,
  viewTasksProps,
} from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import getInitials from "@/lib/functions/user/getInitials";
import getPriorityBgColor from "@/lib/functions/colors/getPriorityBgColor";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import React, {
  MouseEvent,
  PointerEvent,
  TouchEvent,
  useRef,
  useState,
} from "react";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import TaskDeleteWarning from "@/components/warnings/TaskDeleteWarning";
import { createPortal } from "react-dom";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useMounted from "@/lib/hooks/useMounted";
import { canDeleteTask } from "@/lib/hooks/useIsAllowedTask";
import { canDrag } from "@/lib/functions/task/view/board";
import Toolbar from "@/components/helpers/Toolbar";

function TaskCard({
  task,
  role,
  isFilterActive,
  projectSlug,
}: {
  task: viewTasksProps;
  role: projectAuthorityRole;
  isFilterActive: boolean;
  projectSlug: string;
}) {
  const canDragTask = canDrag(task);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !canDragTask || isFilterActive,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? (transform ? "transform 200ms ease" : undefined),
  };
  const { slug } = useCurrentWorkspace();
  const router = useRouter();
  const mounted = useMounted();
  const [showDelWarning, setShowDelWarning] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dropDown, setDropDown] = useState(false);
  useClickOutSide([dropRef], () => setDropDown(false));
  const canDelete = canDeleteTask(role);

  if (!mounted) return null;
  return (
    <>
      <div
        ref={setNodeRef}
        {...(canDragTask ? listeners : {})}
        {...(canDragTask ? attributes : {})}
        style={style}
        className={`h-fit p-3 w-full dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-xl bg-white dark:bg-blk6 break-words overflow-wrap-anywhere ${
          isFilterActive
            ? ""
            : isDragging
              ? "cursor-grabbing opacity-50 scale-105"
              : "cursor-grab"
        } ${!canDragTask ? " cursor-not-allowed" : "cursor-grab"}`}
      >
        <FlexBtwWrapper>
          <div
            className={`${getPriorityBgColor(
              task.priority,
            )} px-1 py-0.5 rounded-md text-xs`}
          >
            {task.priority}
          </div>

          <div className="flex items-center gap-1">
            {task.currentUserTaskRole && (
              <div
                className="cursor-pointer px-0.5 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-blk3 w-fit relative group"
                onClick={() => {
                  router.push(
                    `/app/${slug}/projects/${projectSlug}/tasks/${task.slug}`,
                  );
                }}
                onMouseDown={(
                  e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
                ) => e.stopPropagation()}
                onTouchStart={(e: TouchEvent<HTMLDivElement>) =>
                  e.stopPropagation()
                }
                onPointerDown={(e: PointerEvent<HTMLDivElement>) =>
                  e.stopPropagation()
                }
              >
                <svg
                  className="w-3 h-3 lg:w-4 lg:h-4 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 4h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5"
                  />
                </svg>
                <Toolbar top="-top-5">View Task</Toolbar>
              </div>
            )}

            {canDelete ? (
              <div
                ref={dropRef}
                className="px-0.5 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-blk3 w-fit relative cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropDown((prev) => !prev);
                }}
                onMouseDown={(
                  e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
                ) => e.stopPropagation()}
                onTouchStart={(e: TouchEvent<HTMLDivElement>) =>
                  e.stopPropagation()
                }
                onPointerDown={(e: PointerEvent<HTMLDivElement>) =>
                  e.stopPropagation()
                }
              >
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
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
                <Toolbar top="-top-5">Options</Toolbar>
                <div
                  className={`absolute top-0 -left-36 w-35   bg-gray-200 dark:bg-blk7 shadow-md rounded-md py-1 transition-all duration-300 ${
                    dropDown
                      ? "opacity-100 translate-x-0 visible"
                      : "opacity-0 translate-x-4 invisible pointer-events-none"
                  } `}
                >
                  <ul className="w-full">
                    {canDelete && (
                      <li
                        className="rounded-md px-3 py-0.5 text-gray-800 dark:text-gray-200 text-sm lg:text-base hover:bg-gray-300 dark:hover:bg-blk9"
                        onClick={() => setShowDelWarning(true)}
                      >
                        Delete
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </FlexBtwWrapper>
        <div className="text-gray-900 dark:text-gray-100 text-base xl:text-lg  mt-2">
          {task.name}
        </div>
        <div className="text-gray-500 text-xs text-ellipsis line-clamp-2">
          {task.description}
        </div>
        <FlexBtwWrapper addOns="mt-2 text-gray-600 dark:text-gray-400">
          <div className="px-2 py-1 bg-gray-100 dark:bg-blk4 text-xs rounded-md border border-gray-400 dark:border-gray-600 flex items-center gap-1 relative group ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className=""
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0"
              />
            </svg>
            <div>
              {task.doneSubtasks}/{task.totalSubtasks}
            </div>
            <Toolbar top="-top-7">Subtasks</Toolbar>
          </div>
          <div className="px-2 py-1 bg-gray-100 dark:bg-blk4 text-xs rounded-md border border-gray-400 dark:border-gray-600 flex items-center gap-1 relative group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>

            {DateFormatter2(task.dueDate)}
            <Toolbar top="-top-7">Due Date</Toolbar>
          </div>
        </FlexBtwWrapper>
        <FlexBtwWrapper addOns="mt-2 pt-2 border-t-2 border-gray-200 dark:border-gray-700 ">
          <div className="flex items-center">
            {task.members.slice(0, 3).map((a: basicMember, idx: number) => {
              return (
                <div
                  key={idx}
                  className={`${
                    idx !== 0 ? "-ml-2" : ""
                  } hover:z-10 relative transition-all`}
                  style={{ zIndex: idx + 1 }}
                >
                  {a.avatar ? (
                    <div className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                      <Image
                        alt={"AssigneeAvatar"}
                        src={a.avatar}
                        className="object-center"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center border-2 border-white dark:border-blk5`}
                      style={{ background: gradientBgFromName(a.name) }}
                    >
                      <div className="font-semibold text-xs text-white">
                        {getInitials(a.name)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {task.totalMembers > 3 && (
              <div
                className={`z-6 -ml-2 w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center bg-fuchsia-500 border-2 border-white dark:border-blk5`}
              >
                <div className="font-semibold text-xs text-white">
                  +{task.totalMembers - 3}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs lg:text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3.5 lg:size-4.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              <div className="text-gray-600 dark:text-gray-400">
                {task.comments
                  ? task.comments > 999
                    ? "999+"
                    : task.comments
                  : 0}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs lg:text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3 lg:size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
              <div className="text-gray-600 dark:text-gray-400">
                {task.attachments ?? 0}
              </div>
            </div>
          </div>
        </FlexBtwWrapper>
      </div>
      {mounted &&
        createPortal(
          <TaskDeleteWarning
            show={showDelWarning}
            setShow={setShowDelWarning}
            name={task.name}
            handleDeleting={() => {}}
          />,
          document.body,
        )}
    </>
  );
}
export default React.memo(TaskCard);
