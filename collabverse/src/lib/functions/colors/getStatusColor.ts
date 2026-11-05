export default function getStatusColor(progress: string) {
  if (progress === "To Do") {
    return "text-blue-500";
  } else if (progress === "In Progress") {
    return "text-yellow-500";
  } else if (progress === "In Review") {
    return "text-violet-500";
  } else {
    return "text-green-500";
  }
}
