import { currentTaskProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { PRole, TaskRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskSlug: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskSlug = params.taskSlug;
    if (!workspaceId || !projectId || !taskSlug) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      let userProjectRole: PRole | undefined;
      let userTaskRole: TaskRole | undefined;
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.task.findFirst({
        where: {
          projectId,
          workspaceId,
          slug: taskSlug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
      if (!res) {
        return apiErrorCustom("Task not found");
      }
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        userProjectRole = await projectRole(user.id, workspaceId, projectId);
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
        if (userProjectRole !== "Owner" && userProjectRole !== "Manager") {
          const taskMember = await prisma.taskMember.findUnique({
            where: {
              projectMemberUserId_taskId: {
                projectMemberUserId: user.id,
                taskId: res.id,
              },
            },
            select: {
              role: true,
            },
          });

          if (!taskMember) {
            return apiErrorCustom("You are not authorised");
          }
          userTaskRole = taskMember.role;
        }
      }
      const task: currentTaskProps = {
        ...res,
        role: userTaskRole ?? "High",
      };
      return Response.json({ task }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
