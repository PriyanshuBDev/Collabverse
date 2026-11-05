"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import DroppableColumn from "./DroppableColumn";
import TaskCard from "./TaskCard";
import {
  basicMember,
  taskBoardProps,
  taskFilterProjectProps,
  viewTasksProps,
} from "@/app/interfaces";
import { arrayMove } from "@dnd-kit/sortable";
import { Priority, TaskStatus } from "@prisma/client";
import { statusOrder } from "@/lib/hooks/useIsAllowedTask";
import { canDrag } from "@/lib/functions/task/view/board";
import { useTaskChanges } from "@/lib/queries/workspace/project/task/view/useTaskChanges";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { isAllowedStatusTransition } from "@/lib/functions/task/status/statusTransition";

type TaskboardData = {
  pages: taskBoardProps[];
  pageParams: unknown[];
};

export default function BoardArea({
  selectedDueDate,
  search,
  selectedPriority,
  selectedProject,
  assignedTo,
}: {
  selectedProject: taskFilterProjectProps;
  selectedDueDate?: Date;
  selectedPriority?: Priority;
  search: string;
  assignedTo?: basicMember;
}) {
  const queryClient = useQueryClient();
  const ws = useCurrentWorkspace();
  const getBoardKey = useCallback(
    (status: TaskStatus) => [
      ws.id,
      selectedProject.id,
      "tasks",
      "board",
      status,
      selectedPriority ?? undefined,
      selectedDueDate ?? undefined,
      assignedTo?.id ?? undefined,
      search ?? "",
    ],
    [
      assignedTo?.id,
      search,
      selectedDueDate,
      selectedPriority,
      selectedProject.id,
      ws.id,
    ],
  );
  const { moveMutation, changeStatus } = useTaskChanges({
    projectId: selectedProject.id,
  });
  const [activeTask, setActiveTask] = useState<viewTasksProps | null>(null);
  const isFilterActive =
    search.length > 0 ||
    !!selectedPriority ||
    !!selectedDueDate ||
    !!assignedTo;
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(pointerSensor);

  const getTask = (id: string) => {
    for (const s of statusOrder) {
      const data = queryClient.getQueryData<TaskboardData>(getBoardKey(s));
      if (!data) continue;

      for (const page of data.pages) {
        const found = page.tasks.find((t: viewTasksProps) => t.id === id);
        if (found) return found;
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isFilterActive) return;
    const { active } = event;
    const task = getTask(String(active.id));
    if (!task) return;

    if (!canDrag(task)) return;

    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      if (isFilterActive) return;

      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId === overId) return;

      // 🔥 always get fresh task (NO stale map)
      const getTask = (id: string) => {
        for (const s of statusOrder) {
          const data = queryClient.getQueryData<TaskboardData>(getBoardKey(s));
          if (!data) continue;

          for (const page of data.pages) {
            const found = page.tasks.find((t: viewTasksProps) => t.id === id);
            if (found) return found;
          }
        }
      };

      const movingTask = getTask(activeId);
      if (!movingTask) return;

      const from = movingTask.status;

      let to: TaskStatus | undefined;

      // dropped on column
      if (statusOrder.includes(overId as TaskStatus)) {
        to = overId as TaskStatus;
      } else {
        const overTask = getTask(overId);
        if (!overTask) return;
        to = overTask.status;
      }

      if (!to) return;

      // =========================
      // SAME COLUMN REORDER
      // =========================
      if (from === to) {
        const key = getBoardKey(from);

        queryClient.setQueryData<TaskboardData>(key, (old) => {
          if (!old) return old;

          const updatedPages = old.pages.map((page: taskBoardProps) => {
            const oldIndex = page.tasks.findIndex(
              (t: viewTasksProps) => t.id === activeId,
            );
            const newIndex = page.tasks.findIndex(
              (t: viewTasksProps) => t.id === overId,
            );

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
              return page;

            return {
              ...page,
              tasks: arrayMove(page.tasks, oldIndex, newIndex),
            };
          });

          return { ...old, pages: updatedPages };
        });

        // backend sync (relative positioning)
        const data = queryClient.getQueryData<TaskboardData>(key);
        if (!data) return;

        const allTasks = data.pages.flatMap((p: taskBoardProps) => p.tasks);
        const index = allTasks.findIndex(
          (t: viewTasksProps) => t.id === activeId,
        );

        const prevId = allTasks[index - 1]?.id;
        const nextId = allTasks[index + 1]?.id;

        moveMutation.mutate({
          taskId: activeId,
          status: from,
          prevId,
          nextId,
        });

        return;
      }

      // =========================
      // CROSS COLUMN MOVE
      // =========================

      const fromKey = getBoardKey(from);
      const toKey = getBoardKey(to);

      // REMOVE from source
      queryClient.setQueryData<TaskboardData>(fromKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((p: taskBoardProps) => ({
            ...p,
            tasks: p.tasks.filter((t: viewTasksProps) => t.id !== activeId),
          })),
        };
      });

      // INSERT into target (top insert for stability)
      queryClient.setQueryData<TaskboardData>(toKey, (old) => {
        if (!old) return old;

        const updatedTask = { ...movingTask, status: to };

        return {
          ...old,
          pages: old.pages.map((p: taskBoardProps, i: number) =>
            i === 0 ? { ...p, tasks: [updatedTask, ...p.tasks] } : p,
          ),
        };
      });

      // backend
      changeStatus.mutate({
        taskId: activeId,
        status: to,
      });
    } finally {
      setActiveTask(null);
    }
  };
  const canDropMap = useMemo(() => {
    const obj: Record<string, boolean> = {};

    statusOrder.forEach((s) => {
      obj[s] =
        !activeTask ||
        activeTask.status === s ||
        isAllowedStatusTransition(
          activeTask.status,
          s,
          activeTask.currentUserTaskRole,
        );
    });

    return obj;
  }, [activeTask]);
  return (
    <div className="min-h-screen grid grid-cols-4 overflow-x-auto min-w-300 gap-5 mt-5 pb-20">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // measuring={{
        //   droppable: {
        //     strategy: MeasuringStrategy.Always,
        //   },
        // }}
        modifiers={[]}
        autoScroll={true}
      >
        {statusOrder.map((s: TaskStatus, idx: number) => {
          return (
            <DroppableColumn
              key={idx}
              status={s}
              canDrop={canDropMap[s]}
              project={selectedProject}
              priority={selectedPriority}
              search={search}
              assignedTo={assignedTo}
              dueDate={selectedDueDate}
            />
          );
        })}

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              isFilterActive={isFilterActive}
              task={activeTask}
              projectSlug={selectedProject.slug}
              role={selectedProject.role}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
