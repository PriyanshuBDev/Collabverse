export default function getPriorityBgColor(level: string) {
  if (level === "Low") {
    return "text-emerald-700 bg-emerald-300";
  } else if (level === "Medium") {
    return "text-amber-700 bg-amber-300";
  } else if (level === "High") {
    return "text-orange-700 bg-orange-300";
  } else {
    return "text-red-700 bg-red-300";
  }
}
