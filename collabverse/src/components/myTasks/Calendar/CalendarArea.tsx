"use client";

import {
  basicMember,
  viewTasksProps,
  taskFilterProjectProps,
} from "@/app/interfaces";
import { useState } from "react";
import { format } from "date-fns";
import CalendarCard from "./CalendarCard";
import { Priority, TaskStatus } from "@prisma/client";
import { useTaskCalendar } from "@/lib/queries/workspace/project/task/view/useTaskCalendar";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { getMonthGrid } from "@/lib/functions/task/view/calendar";
type prop = {
  date: Date;
  outside: boolean;
};
export default function CalendarArea({
  search,
  selectedPriority,
  selectedProject,
  selectedStatus,
  assignedTo,
}: {
  selectedProject: taskFilterProjectProps;
  selectedStatus?: TaskStatus;
  selectedPriority?: Priority;
  search: string;
  assignedTo?: basicMember;
}) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const { data, isError, error, isFetching } = useTaskCalendar({
    projectId: selectedProject.id,
    date: current,
    priority: selectedPriority,
    status: selectedStatus,
    search,
    assignedTo: assignedTo?.id,
  });
  useIsErrorToast(isError, "Failed to fetch tasks", error);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = current.getFullYear();
  const month = current.getMonth();

  const groupedTasks = data?.tasks.reduce<Record<string, viewTasksProps[]>>(
    (acc, tasks) => {
      const date = new Date(tasks.dueDate).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(tasks);
      return acc;
    },
    {},
  );
  const sortedGroupedTasks = Object.entries(groupedTasks ?? {}).sort(
    ([a]: [string, viewTasksProps[]], [b]: [string, viewTasksProps[]]) =>
      new Date(a).getTime() - new Date(b).getTime(),
  );

  const grid = getMonthGrid(year, month);
  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center my-4">
        <button
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className="px-3 py-1 border rounded-md cursor-pointer border-gray-400 dark:border-gray-700 "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5 lg:size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <span className="font-semibold text-base lg:text-xl">
          {format(current, "MMMM yyyy")}
        </span>

        <button
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className="px-3 py-1 border rounded-md cursor-pointer border-gray-400 dark:border-gray-700 "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5 lg:size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto pb-10">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 ">
            {days.map((d: string) => (
              <div
                key={d}
                className="text-gray-500 font-medium flex  justify-center"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 h-full w-full grid-rows-6 min-h-screen text-center text-sm border-t border-l mt-3 border-gray-300 dark:border-gray-800 overflow-x-auto">
            {grid.map(({ date, outside }: prop, i: number) => (
              <div
                key={i}
                className={`p-2 col-span-1  row-span-1 h-full w-full  border-r border-b border-gray-300 dark:border-gray-800 ${isFetching ? "animate-pulse dark:bg-blk4 bg-gray-200" : ""} ${
                  outside
                    ? "text-gray-300 dark:text-gray-500"
                    : "text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex justify-end ">{date.getDate()}</div>
                <div
                  className={`flex flex-col md:flex-row w-full mt-1 max-h-[80px] overflow-y-auto  thinScrollbar md:max-h-none md:overflow-visible `}
                >
                  {data &&
                    data.tasks.length > 0 &&
                    sortedGroupedTasks
                      .find(
                        ([key]: [string, viewTasksProps[]]) =>
                          key === date.toISOString().split("T")[0],
                      )?.[1]
                      ?.map((task: viewTasksProps, idx: number) => (
                        <CalendarCard
                          key={task.id}
                          idx={idx}
                          task={task}
                          projectSlug={selectedProject.slug}
                        />
                      ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
