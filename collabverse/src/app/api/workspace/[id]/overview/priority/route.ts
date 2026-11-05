import { priortiyDataProps } from "@/components/charts/PriorityChart";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, Priority } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type priorityProp = {
  priority: $Enums.Priority;
};
export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!workspaceId || !projectId) {
      return new Response("Required param not found", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const project = await prisma.project.findUnique({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: { some: { workspaceMemberUserId: user.id } },
          }),
          id: projectId,
        },
        select: {
          tasks: {
            select: {
              priority: true,
            },
          },
        },
      });
      if (!project) {
        return new Response("Project not found", { status: 404 });
      }
      const tasks = project.tasks;
      const filter = (type: Priority) => {
        return tasks.filter((t: priorityProp) => t.priority === type).length;
      };
      const data: priortiyDataProps[] = [
        { priority: "Low", value: filter("Low") },
        { priority: "Medium", value: filter("Medium") },
        { priority: "High", value: filter("High") },
        { priority: "Critical", value: filter("Critical") },
      ];
      return Response.json({ data }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
