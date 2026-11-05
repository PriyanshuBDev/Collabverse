import { parseActivityTarget } from "@/lib/functions/activity/parseActivityTarget";
import { JsonValue } from "@prisma/client/runtime/client";
import { $Enums } from "@prisma/client";
import { activityProps } from "@/app/interfaces";

interface activitySelectProps {
  meta: JsonValue;
  id: string;
  createdAt: Date;
  type: $Enums.ActivityType;
  target: JsonValue;
  actor: {
    name: string | null;
    id: string;
    avatar: string | null;
  } | null;
  affectedUser: {
    name: string | null;
    id: string;
  } | null;
}

export function activityBuilder({
  memberSet,
  activitySelect,
  workspaceId,
  projectId,
  taskId,
}: {
  memberSet: Set<string>;
  activitySelect: activitySelectProps;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}): activityProps {
  return {
    id: activitySelect.id,
    target: parseActivityTarget(activitySelect.target),
    meta:
      typeof activitySelect.meta === "object" && activitySelect.meta !== null
        ? (activitySelect.meta as Record<string, string | undefined>)
        : undefined,
    type: activitySelect.type,
    createdAt: activitySelect.createdAt,
    workspaceId,
    projectId,
    taskId,
    user:
      !activitySelect.actor || !memberSet.has(activitySelect.actor.id)
        ? {
            id: undefined,
            name: "Former member",
            avatar: "/assets/anonymous.webp",
          }
        : {
            ...activitySelect.actor,
            name: activitySelect.actor.name ?? "unknown",
            avatar: activitySelect.actor.avatar ?? undefined,
          },
    affectedUser: activitySelect.affectedUser
      ? !memberSet.has(activitySelect.affectedUser?.id)
        ? { id: undefined, name: "Former member" }
        : {
            ...activitySelect.affectedUser,
            name: activitySelect.affectedUser.name ?? "unknown",
          }
      : undefined,
  };
}
