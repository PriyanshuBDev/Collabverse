import { taskAuthority } from "@/app/interfaces";
import { statusOrder } from "@/lib/hooks/useIsAllowedTask";
import { TaskStatus } from "@prisma/client";
export const statusMap = (status: TaskStatus) => {
  switch (status) {
    case "Done":
      return "Done";
    case "In_Progress":
      return "In Progress";
    case "In_Review":
      return "In Review";
    case "To_Do":
      return "To Do";
  }
};
const getIndex = (status: TaskStatus) => statusOrder.indexOf(status);
export function isAllowedStatusTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
  role?: taskAuthority,
) {
  if (!role) return false;

  const currentIndex = getIndex(currentStatus);
  const nextIndex = getIndex(nextStatus);
  if (currentIndex === nextIndex) return false;
  if (role === "Assignee") {
    return nextIndex > currentIndex && nextStatus !== "Done";
  }
  if (role === "Reviewer" || role === "High") {
    return true;
  }

  return false;
}
