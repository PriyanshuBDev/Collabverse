import {
  attachmentProps,
  basicMember,
  prismaUserPropShort,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";
import z from "zod";
type rowProp = {
  id: string;
  createdAt: Date;
  type: string;
  fileName: string;
  size: number;
  format: string;
  attachedById: string | null;
  originalName: string;
  path: string;
};
export const cursorSchema = z.object({
  cursorId: z.uuid().optional(),
  cursorCreatedAt: z.coerce.date().optional(),
});
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const limit = 10;
    try {
      const { cursorId, cursorCreatedAt } = cursorSchema.parse(queryObj);
      if ((cursorId && !cursorCreatedAt) || (!cursorId && cursorCreatedAt)) {
        return apiError("Invalid cursor", 400);
      }
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const task = await prisma.task.findFirst({
        where: {
          workspaceId,
          projectId,
          id: taskId,
        },
        select: {
          id: true,
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      const rows = await prisma.attachment.findMany({
        where: {
          taskId,
        },
        cursor:
          cursorId && cursorCreatedAt
            ? {
                createdAt_id: {
                  id: cursorId,
                  createdAt: cursorCreatedAt,
                },
              }
            : undefined,
        take: limit + 1,
        skip: cursorId && cursorCreatedAt ? 1 : 0,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          fileName: true,
          originalName: true,
          size: true,
          format: true,
          attachedById: true,
          createdAt: true,
          path: true,
          type: true,
        },
      });

      const hasMore = rows.length > limit;
      const requiredRows = hasMore ? rows.slice(0, limit) : rows;
      const attachedByIds = new Set<string>();
      requiredRows.forEach((r: rowProp) => {
        if (r.attachedById) {
          attachedByIds.add(r.attachedById);
        }
      });
      const attachedByMap = new Map<string, basicMember>();
      const users = await prisma.workspaceMember.findMany({
        where: {
          userId: {
            in: [...attachedByIds],
          },
          workspaceId,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      users.forEach((u: prismaUserPropShort) => {
        const user = u.user;
        attachedByMap.set(user.id, {
          id: user.id,
          name: user.name ?? "unknown",
          avatar: user.avatar ?? undefined,
        });
      });
      const defaultUser = {
        id: undefined,
        name: "Former user",
        avatar: "/assets/anonymous.webp",
      };
      const attachments: attachmentProps[] = requiredRows.map((r: rowProp) => ({
        ...r,
        attachedBy: r.attachedById
          ? (attachedByMap.get(r.attachedById) ?? defaultUser)
          : defaultUser,
      }));
      const last =
        attachments.length > 0 ? attachments[attachments.length - 1] : null;
      return Response.json(
        {
          attachments,
          nextCursor:
            hasMore && last
              ? { cursorId: last.id, cursorCreatedAt: last.createdAt }
              : null,
          hasMore,
        },
        { status: 200 },
      );
    } catch (e) {
      console.log(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
