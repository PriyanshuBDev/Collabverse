import { ActivityTarget } from "@/app/interfaces";

export function parseActivityTarget(target: unknown): ActivityTarget | null {
  if (!target || typeof target !== "object") return null;

  const t = target as Record<string, unknown>;

  return {
    id: typeof t.id === "string" ? t.id : undefined,
    name: typeof t.name === "string" ? t.name : undefined,
    field: typeof t.field === "string" ? t.field : undefined,
    oldValue: typeof t.oldValue === "string" ? t.oldValue : undefined,
    newValue: typeof t.newValue === "string" ? t.newValue : undefined,
  };
}
