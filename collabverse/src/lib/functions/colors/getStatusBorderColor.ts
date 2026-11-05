export default function getStatusBorderColor(progress: string) {
  if (progress === "To Do") {
    return "border-blue-500";
  } else if (progress === "In Progress") {
    return "border-yellow-500";
  } else if (progress === "In Review") {
    return "border-violet-500";
  } else {
    return "border-green-500";
  }
}
