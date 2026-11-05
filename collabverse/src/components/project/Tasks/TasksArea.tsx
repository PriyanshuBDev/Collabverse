"use client";

import BoardArea from "@/components/myTasks/Board/BoardArea";
import CalendarArea from "@/components/myTasks/Calendar/CalendarArea";
import TableArea from "@/components/myTasks/Table/TableArea";
import ProjectTaskViewToggler from "@/components/Toggler/ProjectTaskViewToggler";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { useState } from "react";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useIsAllowedToCreateTask } from "@/lib/hooks/useIsAllowedTask";
import StatusFilter from "@/components/myTasks/filters/StatusFilter";
import DueDateFilter from "@/components/myTasks/filters/DueDateFilter";
import PriorityFilter from "@/components/myTasks/filters/PriorityFilter";
import AssignedToFilter from "@/components/myTasks/filters/AssignedToFilter";
import { basicMember, taskFilterProjectProps } from "@/app/interfaces";
import { Priority, TaskStatus } from "@prisma/client";
import Searchbar from "../Overview/Searchbar";
import NewTaskBtnProject from "@/components/btns/task/NewTaskBtnProject";

export default function TasksArea() {
  const [active, setActive] = useState<number | null>(null);
  const { slug, id, name, avatar, role } = useCurrentProject();
  const canCreateTask = useIsAllowedToCreateTask();
  const [assignedTo, setAssignedTo] = useState<basicMember | undefined>(
    undefined,
  );
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [search, setSearch] = useState("");
  const project: taskFilterProjectProps = {
    id,
    name,
    avatar,
    role,
    slug,
  };
  return (
    <div className="pb-10 mt-3 h-full">
      <FlexBtwWrapper>
        <div className="w-full">
          <ProjectTaskViewToggler
            active={active}
            setActive={setActive}
            slug={slug}
          />
        </div>
        {canCreateTask && <NewTaskBtnProject />}
      </FlexBtwWrapper>
      <div className="flex lg:flex-row flex-col gap-2 mt-3 lg:justify-between">
        <div className="flex gap-1">
          <PriorityFilter
            selectedPriority={priority}
            setSelectedPriority={setPriority}
          />
          {active === 2 ? (
            <StatusFilter
              selectedStatus={status}
              setSelectedStatus={setStatus}
            />
          ) : (
            <DueDateFilter
              selectedDate={dueDate}
              setSelectedDate={setDueDate}
            />
          )}

          <AssignedToFilter
            selectedProject={project}
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
          />
        </div>
        <Searchbar
          setSearch={setSearch}
          search={search}
          placeholder="Search tasks"
          width="max-w-md w-full"
        />{" "}
      </div>

      {active === 0 && (
        <TableArea
          search={search}
          selectedDueDate={dueDate}
          selectedPriority={priority}
          selectedProject={project}
          assignedTo={assignedTo}
        />
      )}
      {active === 1 && (
        <BoardArea
          search={search}
          selectedDueDate={dueDate}
          selectedPriority={priority}
          selectedProject={project}
          assignedTo={assignedTo}
        />
      )}
      {active === 2 && (
        <CalendarArea
          search={search}
          selectedStatus={status}
          selectedPriority={priority}
          selectedProject={project}
          assignedTo={assignedTo}
        />
      )}
    </div>
  );
}
