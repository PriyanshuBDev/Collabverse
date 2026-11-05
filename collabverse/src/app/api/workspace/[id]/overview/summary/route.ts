import { wsSummaryProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type statusProp = {
  status: $Enums.TaskStatus;
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;

    if (!workspaceId) {
      return new Response("Required param not found", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const [projects, tasks] = await Promise.all([
        prisma.project.count({
          where: {
            workspaceId,
            ...(role === "Member" && {
              members: { some: { workspaceMemberUserId: user.id } },
            }),
          },
        }),
        prisma.task.findMany({
          where: {
            workspaceId,
            ...(role === "Member" && {
              members: {
                some: {
                  projectMemberUserId: user.id,
                },
              },
            }),
          },
          select: {
            status: true,
          },
        }),
      ]);
      const data: wsSummaryProps[] = [
        { title: "Total Projects", value: projects },
        { title: "Total Tasks", value: tasks.length },
        {
          title: "Tasks To Do",
          value: tasks.filter((t: statusProp) => t.status === "To_Do").length,
        },
        {
          title: "Tasks Done",
          value: tasks.filter((t: statusProp) => t.status === "Done").length,
        },
      ];
      return Response.json({ data }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
