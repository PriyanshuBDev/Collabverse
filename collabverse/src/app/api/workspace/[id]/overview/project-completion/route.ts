import { CBDataProps } from "@/components/progress/CompletionBar";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
export interface projectCompletionProps {
  totalTasks: number;
  completedTasks: number;
}
type projProp = {
  id: string;
  tasks: {
    status: $Enums.TaskStatus;
  }[];
};
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
      const projects = await prisma.project.findMany({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: { some: { workspaceMemberUserId: user.id } },
          }),
        },
        select: {
          id: true,
          tasks: {
            select: {
              status: true,
            },
          },
        },
      });
      const projectProps: projectCompletionProps[] = projects.map(
        (p: projProp) => {
          return {
            totalTasks: p.tasks.length,
            completedTasks: p.tasks.filter(
              (t: statusProp) => t.status === "Done",
            ).length,
          };
        },
      );
      const data: CBDataProps[] = [
        {
          status: "Not Started",
          value: projectProps.filter(
            (p: projectCompletionProps) => p.totalTasks === 0,
          ).length,
        },
        {
          status: "In Progress",
          value: projectProps.filter(
            (p: projectCompletionProps) => p.completedTasks < p.totalTasks,
          ).length,
        },
        {
          status: "Done",
          value: projectProps.filter(
            (p: projectCompletionProps) =>
              p.completedTasks === p.totalTasks && p.totalTasks > 1,
          ).length,
        },
      ];
      return Response.json({ data }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
