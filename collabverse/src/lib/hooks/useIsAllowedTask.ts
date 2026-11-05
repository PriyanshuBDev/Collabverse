import { projectAuthorityRole, taskAuthority } from "@/app/interfaces";
import { useCurrentProject } from "./useCurrentProject";
import { TaskStatus } from "@prisma/client";
import { useCurrentTask } from "./useCurrentTask";

export function useIsAllowedToCreateTask() {
  const project = useCurrentProject();
  if (!project) return false;
  if (
    project.role === "Owner" ||
    project.role === "Manager" ||
    project.role === "High"
  )
    return true;
  return false;
}

export function useIsAllowedToDeleteTask() {
  return useIsAllowedToCreateTask();
}
export function useIsAllowedToAddTaskUser() {
  return useIsAllowedToCreateTask();
}
export function useIsAllowedToAttach() {
  const { role } = useCurrentTask();
  if (!role) return false;
  if (role === "Assignee" || role === "High" || role === "Reviewer") {
    return true;
  }
  return false;
}
export function canChangeTaskStatus(
  status: TaskStatus,
  taskRole?: taskAuthority,
) {
  if (!taskRole) return false;
  if (status === "Done" || status === "In_Review") {
    if (taskRole === "Reviewer" || taskRole === "High") {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}
export const statusOrder: TaskStatus[] = [
  "To_Do",
  "In_Progress",
  "In_Review",
  "Done",
];

export function canCreateTask(role: projectAuthorityRole) {
  if (role === "High" || role === "Manager" || role === "Owner") {
    return true;
  }
  return false;
}
export function canDeleteTask(role: projectAuthorityRole) {
  return canCreateTask(role);
}

export function useCanEditTask() {
  const { role } = useCurrentTask();
  if (role === "Assignee" || role === "High") {
    return true;
  }
  return false;
}
