import TaskDeleteWarning from "@/components/warnings/TaskDeleteWarning";
import TaskLeaveWarning from "@/components/warnings/TaskLeaveWarning";
import SubBorderWrapper from "@/components/wrappers/SubBorderWrapper";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useTaskSettings } from "@/lib/queries/workspace/project/task/settings/useTaskSettings";
import { useState } from "react";

export function TaskSettingsArea() {
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState(false);
  const project = useCurrentProject();
  const { deleteMutation, leave } = useTaskSettings();
  const task = useCurrentTask();
  return (
    <div className="flex flex-col items-center gap-5">
      {task.role === "High" && (
        <SubBorderWrapper addOns="mt-3 w-full">
          <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
            Delete
          </div>
          <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
            This is an irreversible action. Be careful!
          </div>
          <div
            className=" bg-red-500 hover:bg-red-700 cursor-pointer rounded-md px-3 py-1 w-fit text-white"
            onClick={() => setDeleteWarning(true)}
          >
            Delete
          </div>
          <TaskDeleteWarning
            show={deleteWarning}
            setShow={setDeleteWarning}
            handleDeleting={() => {
              deleteMutation.mutate({
                taskId: task.id,
                projectId: project.id,
                projectSlug: project.slug,
                shouldRoute: true,
              });
            }}
            name={task.name}
          />
        </SubBorderWrapper>
      )}
      {(task.role === "Assignee" || task.role === "Reviewer") && (
        <SubBorderWrapper addOns="mt-3 w-full">
          <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
            Leave Workspace
          </div>
          <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
            All your current work and progress will be lost.
          </div>
          <div
            className="bg-gray-300 dark:bg-blk6 hover:bg-red-500 cursor-pointer rounded-md px-3 py-1 w-fit text-gray-700 hover:text-white dark:text-white"
            onClick={() => setLeaveWarning(true)}
          >
            Leave
          </div>
          <TaskLeaveWarning
            showWarning={leaveWarning}
            setShowWarning={setLeaveWarning}
            handleLeaving={() =>
              leave.mutate({
                projectId: project.id,
                projectSlug: project.slug,
                taskId: task.id,
                shouldRoute: true,
              })
            }
          />
        </SubBorderWrapper>
      )}
    </div>
  );
}
