import { activityProps, cursorProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { parseActivityTarget } from "@/lib/functions/activity/parseActivityTarget";
import { isWorkspaceMember } from "@/lib/serviceLayer/workspace/isWorkspaceMember";
import { User } from "@supabase/supabase-js";
import { cursorSchema } from "../../projects/[projectId]/tasks/[taskId]/attachments/route";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { JsonValue } from "@prisma/client/runtime/client";
import { $Enums } from "@prisma/client";
type userIdProp = { userId: string };
type rowProp = {
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
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    if (!workspaceId) {
      return new Response("Required param not found", { status: 400 });
    }

    try {
      const { cursorId, cursorCreatedAt } = cursorSchema.parse(queryObj);
      const isAllowed = await isWorkspaceMember(user.id, workspaceId);

      if (!isAllowed) {
        return apiErrorCustom("Invalid parameters");
      }
      const rows = await prisma.activity.findMany({
        where: {
          workspaceId,
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
              "project_created",
              "project_deleted",
              "workspace_avatar_updated",
              "workspace_created",
              "workspace_description_updated",
              "workspace_member_added",
              "workspace_member_left",
              "workspace_member_removed",
              "workspace_member_role_changed",
              "workspace_name_updated",
              "workspace_ownership_changed",
              "workspace_settings_updated",
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
      const activities: activityProps[] = requiredRows.map((a: rowProp) => {
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
      return zodApiError(e);
    }
  },
);
