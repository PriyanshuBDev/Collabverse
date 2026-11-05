import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/db/prisma";
import { activityProps, cursorProps, userIdProp } from "@/app/interfaces";
import { parseActivityTarget } from "@/lib/functions/activity/parseActivityTarget";
import { cursorSchema } from "../tasks/[taskId]/attachments/route";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { JsonValue } from "@prisma/client/runtime/client";
import { $Enums } from "@prisma/client";
type resProp = {
  id: string;
  createdAt: Date;
  target: JsonValue;
  meta: JsonValue;
  type: $Enums.ActivityType;
  actor: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
  affectedUser: {
    id: string;
    name: string | null;
  } | null;
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const { cursorId, cursorCreatedAt } = cursorSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const rows = await prisma.activity.findMany({
        where: {
          workspaceId,
          projectId,
          ...(cursorCreatedAt && cursorId
            ? {
                OR: [
                  {
                    createdAt: {
                      lt: new Date(cursorCreatedAt),
                    },
                  },
                  {
                    createdAt: new Date(cursorCreatedAt),
                    id: {
                      lt: cursorId,
                    },
                  },
                ],
              }
            : {}),
          type: {
            in: [
              "project_avatar_updated",
              "project_created",
              "project_description_updated",
              "project_due_updated",
              "project_member_added",
              "project_member_left",
              "project_member_removed",
              "project_member_role_changed",
              "project_mentioned",
              "project_name_updated",
              "project_ownership_changed",
              "task_created",
              "task_deleted",
              "other",
            ],
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
          { id: "desc" },
        ],
        take: PAGE_SIZE + 1,
        skip: cursorId && cursorCreatedAt ? 1 : 0,
        select: {
          id: true,
          target: true,
          meta: true,
          type: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          affectedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      const hasMore = rows.length > PAGE_SIZE;
      const requiredRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
      const userIds = new Set<string>();
      requiredRows.forEach((a) => {
        if (a.affectedUser?.id) {
          userIds.add(a.affectedUser.id);
        }
        if (a.actor?.id) {
          userIds.add(a.actor.id);
        }
      });
      const members = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: {
            in: [...userIds],
          },
        },
        select: {
          userId: true,
        },
      });
      const memberSet = new Set(members.map((m: userIdProp) => m.userId));
      const activities: activityProps[] = requiredRows.map((a: resProp) => {
        return {
          id: a.id,
          target: parseActivityTarget(a.target),
          meta:
            typeof a.meta === "object" && a.meta !== null
              ? (a.meta as Record<string, string | undefined>)
              : undefined,
          type: a.type,
          createdAt: a.createdAt,
          workspaceId,
          user:
            !a.actor || !memberSet.has(a.actor.id)
              ? {
                  id: undefined,
                  name: "Former member",
                  avatar: "/assets/anonymous.webp",
                }
              : {
                  ...a.actor,
                  name: a.actor.name ?? "unknown",
                  avatar: a.actor.avatar ?? undefined,
                },
          affectedUser: a.affectedUser
            ? !memberSet.has(a.affectedUser?.id)
              ? { id: undefined, name: "Former member" }
              : { ...a.affectedUser, name: a.affectedUser.name ?? "unknown" }
            : undefined,
        };
      });
      const last =
        activities.length > 0 ? activities[activities.length - 1] : null;
      const nextCursor: cursorProps | null =
        hasMore && last
          ? {
              cursorId: last.id,
              cursorCreatedAt: last.createdAt,
            }
          : null;
      return Response.json(
        { activities, nextCursor, hasMore },
        { status: 200 },
      );
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
