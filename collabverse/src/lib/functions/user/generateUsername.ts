export function generateUsername(name: string) {
  return (
    "@" +
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20)
  );
}
