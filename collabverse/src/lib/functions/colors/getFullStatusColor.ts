import { TaskStatus } from "@prisma/client";

export default function getFullStatusColor(progress: TaskStatus) {
  if (progress === "To_Do") {
    return "text-blue-700 bg-blue-300";
  } else if (progress === "In_Progress") {
    return "text-yellow-700 bg-yellow-300";
  } else if (progress === "In_Review") {
    return "text-violet-700 bg-violet-300";
  } else {
    return "text-green-700 bg-green-300";
  }
}
