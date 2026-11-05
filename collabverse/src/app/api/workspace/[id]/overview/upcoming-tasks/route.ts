import { dueDateCursorProps, upcomingTasksProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { zodApiError } from "@/lib/functions/error/apiError";
import { isWorkspaceMember } from "@/lib/serviceLayer/workspace/isWorkspaceMember";
import { User } from "@supabase/supabase-js";
import { addDays } from "date-fns";
import z from "zod";

export interface upcomingTasksResProps {
  items: upcomingTasksProps[];
  nextCursor: dueDateCursorProps | null;
  hasMore: boolean;
}
export const upcomingTasksSchema = z.object({
  cursorDueDate: z.coerce.date().optional(),
  cursorId: z.uuid().optional(),
});
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 10;
    if (!workspaceId) {
      return new Response("Required param not found", { status: 400 });
    }
    const now = new Date();
    const afterSevenDays = addDays(now, 7);
    try {
      const { cursorId, cursorDueDate } = upcomingTasksSchema.parse(queryObj);
      const isAllowed = await isWorkspaceMember(user.id, workspaceId);

      if (!isAllowed) {
        return new Response("You are not authorised", { status: 403 });
      }
      const rows = await prisma.task.findMany({
        where: {
          workspaceId,
          ...(cursorDueDate && cursorId
            ? {
                OR: [
                  {
                    dueDate: {
                      lt: new Date(cursorDueDate),
                    },
                  },
                  {
                    dueDate: new Date(cursorDueDate),
                    id: {
                      lt: cursorId,
                    },
                  },
                ],
              }
            : {}),
          members: {
            some: {
              projectMemberUserId: user.id,
            },
          },
          dueDate: {
            gte: now,
            lte: afterSevenDays,
          },
        },
        orderBy: [{ dueDate: "desc" }, { id: "desc" }],
        take: PAGE_SIZE + 1,
        skip: cursorDueDate && cursorId ? 1 : 0,
        select: {
          id: true,
          name: true,
          dueDate: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      });
      const hasMore = rows.length > PAGE_SIZE;
      const upcomingTasks: upcomingTasksProps[] = hasMore
        ? rows.slice(0, PAGE_SIZE)
        : rows;
      const last =
        upcomingTasks.length > 0
          ? upcomingTasks[upcomingTasks.length - 1]
          : null;
      const nextCursor: dueDateCursorProps | null =
        hasMore && last
          ? {
              cursorId: last.id,
              cursorDueDate: last.dueDate,
            }
          : null;
      return Response.json(
        { items: upcomingTasks, nextCursor, hasMore },
        { status: 200 },
      );
    } catch (e) {
      return zodApiError(e);
    }
  },
);
