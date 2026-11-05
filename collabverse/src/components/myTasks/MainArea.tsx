"use client";

import { useEffect, useState } from "react";
import ViewToggler from "../Toggler/ViewToggler";
import TableArea from "./Table/TableArea";
import BoardArea from "./Board/BoardArea";
import { basicMember, taskFilterProjectProps } from "../../app/interfaces";
import CalendarArea from "./Calendar/CalendarArea";
import ProjectFilter from "./filters/ProjectFilter";
import StatusFilter from "./filters/StatusFilter";
import { Priority, TaskStatus } from "@prisma/client";
import PriorityFilter from "./filters/PriorityFilter";
import DueDateFilter from "./filters/DueDateFilter";
import Searchbar from "../project/Overview/Searchbar";
import Spinner1 from "../loadings/Spinner1";
import AssignedToFilter from "./filters/AssignedToFilter";
import { useTaskProjectFilter } from "@/lib/queries/workspace/project/task/view/useTaskProjectFilter";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import EmptyTasks from "./EmptyTask";

export default function MainArea() {
  const [active, setActive] = useState<number | null>(null);
  const { data, isLoading, isError, error } = useTaskProjectFilter();
  const [project, setProject] = useState<taskFilterProjectProps | undefined>(
    undefined,
  );
  const [assignedTo, setAssignedTo] = useState<basicMember | undefined>(
    undefined,
  );
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [search, setSearch] = useState("");
  useIsErrorToast(isError, "Failed to fetch projects", error);

  useEffect(() => {
    const handleLastProject = () => {
      if (data && data.length > 0) {
        const lastOpen = localStorage.getItem("MyTasksLastActiveProject");
        if (!lastOpen) {
          localStorage.setItem(
            "MyTasksLastActiveProject",
            data.at(0)?.id ?? "",
          );
        }
        const lastProject = data.find(
          (d: taskFilterProjectProps) => d.id === lastOpen,
        );
        setProject(lastProject);
      }
    };
    handleLastProject();
  }, [setActive, data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-full ">
        <Spinner1 size="size-10 lg:size-14"></Spinner1>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className=" flex justify-center items-center w-full  text-gray-600 dark:text-gray-400 lg:text-lg">
        <EmptyTasks />
      </div>
    );
  }
  if (!project) return false;
  return (
    <div className="pb-10 mt-3 h-full">
      <ViewToggler active={active} setActive={setActive}></ViewToggler>
      <div className="flex lg:flex-row flex-col gap-2 mt-3 lg:justify-between">
        <div className="flex gap-1">
          <ProjectFilter
            data={data}
            selectedProject={project}
            setSelectedProject={setProject}
          />
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
        />
      </div>

      <div className="w-full h-full">
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
    </div>
  );
}
