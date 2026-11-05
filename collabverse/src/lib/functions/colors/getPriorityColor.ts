export default function getPriorityColor(level: string) {
  if (level === "Low") {
    return "text-[#34d399]";
  } else if (level === "Medium") {
    return "text-[#fbbf24]";
  } else if (level === "High") {
    return "text-[#f97316]";
  } else {
    return "text-[#ef4444]";
  }
}
