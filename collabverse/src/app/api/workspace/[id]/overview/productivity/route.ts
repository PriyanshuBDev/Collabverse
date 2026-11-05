import { PCDataProps } from "@/components/charts/ProductivityChart";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { getDaysUpToToday } from "@/lib/functions/date/getDaysUptoToday";
import { zodApiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import { isSameDay, startOfWeek } from "date-fns";
import { format, startOfMonth } from "date-fns";
import z from "zod";
type taskProp = {
  status: $Enums.TaskStatus;
  dueDate: Date;
  completedAt: Date | null;
};
export const timePeriodSchema = z.object({
  timePeriod: z.enum(["Week", "Month"]),
});
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    if (!workspaceId) {
      return new Response("Required param not found", { status: 400 });
    }
    try {
      const { timePeriod } = timePeriodSchema.parse(queryObj);
      const today = new Date();
      const start =
        timePeriod === "Week" ? startOfWeek(today) : startOfMonth(today);
      const days = getDaysUpToToday(start);
      const formatType = timePeriod === "Week" ? "EEE" : "MMM dd";
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const tasks = await prisma.task.findMany({
        where: {
          workspaceId,
          OR: [
            {
              dueDate: {
                gte: days[0],
                lte: today,
              },
            },
            {
              completedAt: {
                gte: days[0],
                lte: today,
              },
            },
          ],
          ...(role === "Member" && {
            members: {
              some: {
                projectMemberUserId: user.id,
              },
            },
          }),
        },
        select: {
          dueDate: true,
          completedAt: true,
          status: true,
        },
      });
      const data: PCDataProps[] = days.map((day: Date) => {
        const planned = tasks.filter(
          (t: taskProp) => t.dueDate && isSameDay(t.dueDate, day),
        ).length;
        const actual = tasks.filter(
          (t: taskProp) =>
            t.completedAt &&
            t.status === "Done" &&
            isSameDay(t.completedAt, day),
        ).length;
        return {
          date: format(day, formatType),
          planned,
          actual,
        };
      });
      return Response.json({ data }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
