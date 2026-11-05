import { TaskStatus } from "@prisma/client";
import { useMemo } from "react";

export function useTaskStatus(status: TaskStatus) {
  const data = useMemo(() => {
    switch (status) {
      case "To_Do":
        return {
          bg: "bg-blue-300",
          text: "text-blue-700",
          border: "border-blue-500",
        };
      case "In_Progress":
        return {
          bg: "bg-yellow-300",
          text: "text-yellow-700",
          border: "border-yellow-500",
        };
      case "In_Review":
        return {
          bg: "bg-violet-300",
          text: "text-violet-700",
          border: "border-violet-500",
        };
      case "Done":
        return {
          bg: "bg-green-300",
          text: "text-green-700",
          border: "border-greeen-500",
        };
      default:
        return { border: "", bg: "", text: "" };
    }
  }, [status]);
  return { ...data };
}
