import { viewTasksProps } from "@/app/interfaces";

const GAP = 1000;

export function getNewPosition(tasks: viewTasksProps[], index: number) {
  const prev = tasks[index - 1];
  const next = tasks[index + 1];

  if (!prev && next) return next.position - GAP;
  if (prev && !next) return prev.position + GAP;

  if (prev && next) {
    return Math.floor((prev.position + next.position) / 2);
  }

  return GAP;
}
export const canDrag = (task: viewTasksProps): boolean => {
  const reviewerPerm =
    task.currentUserTaskRole === "Reviewer" ||
    task.currentUserTaskRole === "High";
  if (task.status === "In_Review" || task.status === "Done") {
    return reviewerPerm;
  }

  return true;
};
