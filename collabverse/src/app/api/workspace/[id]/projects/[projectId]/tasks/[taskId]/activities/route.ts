import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/db/prisma";
import { activityProps, cursorProps, userIdProp } from "@/app/interfaces";
import { activityBuilder } from "@/lib/serviceLayer/activity/activityBuilder";
import { JsonValue } from "@prisma/client/runtime/client";
import { $Enums } from "@prisma/client";
import { cursorSchema } from "@/lib/functions/route/cursorSchema";
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
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const { cursorId, cursorCreatedAt } = cursorSchema.parse(queryObj);
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const rows = await prisma.activity.findMany({
        where: {
          workspaceId,
          projectId,
          taskId,
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
              "task_attachment_added",
              "task_attachment_deleted",
              "task_created",
              "task_description_updated",
              "task_due_updated",
              "task_member_added",
              "task_member_left",
              "task_member_removed",
              "task_member_role_changed",
              "task_mentioned",
              "task_name_updated",
              "task_priority_updated",
              "task_status_updated",
              "subtask_added",
              "subtask_completed",
              "subtask_deleted",
              "subtask_unmarked",
              "subtask_updated",
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
      requiredRows.forEach((a: rowProp) => {
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
        return activityBuilder({
          memberSet,
          workspaceId,
          activitySelect: a,
          projectId,
          taskId,
        });
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
