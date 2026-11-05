export function truncateFileName(name: string, maxLength = 25) {
  if (name.length <= maxLength) return name;

  const ext = name.split(".").pop();
  const base = name.slice(0, name.length - (ext?.length ?? 0) - 1);

  const truncatedBase = base.slice(0, maxLength - ext!.length - 4); // 3 dots + dot
  return `${truncatedBase}...${ext}`;
}
