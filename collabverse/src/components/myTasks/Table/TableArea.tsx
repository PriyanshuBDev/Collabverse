"use client";

import {
  basicMember,
  taskFilterProjectProps,
  viewTasksProps,
} from "@/app/interfaces";
import TableByStatus from "./TableByStatus";
import { useState } from "react";
import { Priority, TaskStatus } from "@prisma/client";
import Pagination from "@/components/users/List/Pagination";
import { useTaskTable } from "@/lib/queries/workspace/project/task/view/useTaskTable";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { statusOrder } from "@/lib/hooks/useIsAllowedTask";
import EmptyTasks from "../EmptyTask";

export default function TableArea({
  selectedProject,
  selectedDueDate,
  selectedPriority,
  search,
  assignedTo,
}: {
  selectedProject: taskFilterProjectProps;
  selectedDueDate?: Date;
  selectedPriority?: Priority;
  search: string;
  assignedTo?: basicMember;
}) {
  const [page, setPage] = useState(1);
  const { data, isFetching, isError, error } = useTaskTable({
    projectId: selectedProject.id,
    page,
    due: selectedDueDate,
    assignedTo: assignedTo?.id,
    search,
    priority: selectedPriority,
  });
  const status = statusOrder;
  useIsErrorToast(isError, "Filted to fetch tasks", error);
  if (isFetching) {
    return <TableSkeleton />;
  }

  if (!data || data.total === 0) {
    return (
      <div className=" flex justify-center items-center w-full  text-gray-600 dark:text-gray-400 lg:text-lg">
        <EmptyTasks />
      </div>
    );
  }

  const groupedTasks = data.tasks.reduce(
    (groups: Record<TaskStatus, viewTasksProps[]>, task: viewTasksProps) => {
      const key = task.status;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
      return groups;
    },
    {} as Record<TaskStatus, viewTasksProps[]>,
  );

  return (
    <div>
      {status.map(
        (status: TaskStatus) =>
          groupedTasks[status] && (
            <TableByStatus
              key={status}
              title={status}
              role={selectedProject.role}
              tasks={groupedTasks[status]}
              projectSlug={selectedProject.slug}
            />
          ),
      )}
      <Pagination
        page={page}
        setPage={setPage}
        totalPage={Math.ceil(data.total / data.limit)}
        total={data.total}
      />
    </div>
  );
}
