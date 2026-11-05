import {
  basicMember,
  taskBoardProps,
  taskFilterProjectProps,
  viewTasksProps,
} from "@/app/interfaces";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getStatusBorderColor from "@/lib/functions/colors/getStatusBorderColor";
import { createPortal } from "react-dom";
import React, { useMemo, useState } from "react";
import NewTaskModal from "@/components/btns/task/NewTaskModal";
import useMounted from "@/lib/hooks/useMounted";
import { canCreateTask } from "@/lib/hooks/useIsAllowedTask";
import { useTaskBoard } from "@/lib/queries/workspace/project/task/view/useTaskBoard";
import { Priority, TaskStatus } from "@prisma/client";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";

import TaskBoardSkeleton from "@/components/skeletons/TaskBoardSkeleton";
import { statusMap } from "@/lib/functions/task/status/statusTransition";
function DroppableColumn({
  status,
  canDrop,
  project,
  priority,
  search,
  assignedTo,
  dueDate,
}: {
  status: TaskStatus;
  canDrop: boolean;
  project: taskFilterProjectProps;
  dueDate?: Date;
  priority?: Priority;
  search: string;
  assignedTo?: basicMember;
}) {
  const [show, setShow] = useState(false);
  const mounted = useMounted();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      canDrop: canDrop,
    },
  });
  const {
    data,
    isPending,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    error,
  } = useTaskBoard({
    projectId: project.id,
    status,
    assignedTo: assignedTo?.id,
    priority,
    due: dueDate,
    search,
  });
  useIsErrorToast(isError, "Failed to fetch tasks", error);
  const canCreate = canCreateTask(project.role);
  const tasks = useMemo(
    () => data?.pages.flatMap((p: taskBoardProps) => p.tasks) ?? [],
    [data?.pages],
  );
  const taskIds = useMemo(
    () => tasks.map((t: viewTasksProps) => t.id),
    [tasks],
  );

  const mappedStatus = statusMap(status);
  const isFilterActive =
    search.length > 0 || !!priority || !!dueDate || !!assignedTo;
  return (
    <>
      <div>
        <div
          className={`border-l-6 rounded-lg bg-gray-200 dark:bg-blk4 px-4 py-2 mb-3 ${getStatusBorderColor(
            mappedStatus,
          )}`}
        >
          <FlexBtwWrapper>
            <div className="flex items-center gap-2">
              <div
                className={` font-semibold text-gray-900 dark:text-gray-100`}
              >
                {mappedStatus}
              </div>
              <div className=" rounded-md p-1 px-2.5 py-0.5 bg-gray-100 dark:bg-blk6">
                {tasks.length}
              </div>
            </div>
            {canCreate && (
              <div
                className="p-0.5 rounded-full hover:bg-gray-100 hover:dark:bg-blk6 cursor-pointer"
                onClick={() => setShow(true)}
              >
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
            )}
          </FlexBtwWrapper>
        </div>
        <div
          ref={setNodeRef}
          className={`flex flex-col items-center p-2  rounded-xl h-full transition-all duration-200 ${
            isFilterActive
              ? "bg-gray-200 dark:bg-blk4"
              : !canDrop
                ? "bg-red-200 dark:bg-red-900/40 cursor-not-allowed"
                : isOver
                  ? "bg-blue-100 dark:bg-blue-900/40 scale-[1.02] shadow-lg"
                  : "bg-gray-200 dark:bg-blk4"
          }`}
        >
          {" "}
          {isPending && !data ? (
            <TaskBoardSkeleton />
          ) : (
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {tasks.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 w-full">
                    {tasks.map((t: viewTasksProps) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        projectSlug={project.slug}
                        role={project.role}
                        isFilterActive={isFilterActive}
                      ></TaskCard>
                    ))}
                    {isFetchingNextPage && <TaskBoardSkeleton count={3} />}
                    {!isFetchingNextPage && hasNextPage && (
                      <div className="w-full flex justify-center">
                        <button
                          disabled={!hasNextPage || isFetchingNextPage}
                          onClick={() => fetchNextPage()}
                          className="dark:bg-blk5 bg-gray-300 border-t-2 border-gray-50 dark:border-blk8 rounded-full text-gray-700 dark:text-gray-300 text-sm lg:text-base cursor-pointer w-fit px-4 py-1.5"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full items-center flex justify-center text-gray-500 text-sm lg:text-base">
                  No tasks yet
                </div>
              )}
            </SortableContext>
          )}
        </div>
      </div>
      {mounted &&
        createPortal(
          <NewTaskModal
            show={show}
            setShow={setShow}
            selectedStatus={status}
            project={project}
          />,
          document.body,
        )}
    </>
  );
}
export default React.memo(DroppableColumn);
