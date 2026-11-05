export default function getInitials(fullName: string) {
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
