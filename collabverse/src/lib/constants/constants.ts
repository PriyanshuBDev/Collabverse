import { Priority, TaskRole, TaskStatus } from "@prisma/client";

export const priorityArray: Priority[] = ["High", "Medium", "Low", "Critical"];
export const statusArray: TaskStatus[] = [
  "To_Do",
  "In_Review",
  "In_Progress",
  "Done",
];
export const taskRolesArray: TaskRole[] = [
  TaskRole.Assignee,
  TaskRole.Reviewer,
];

export const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];
export const CALL_TIMEOUT = 30 * 1000;
