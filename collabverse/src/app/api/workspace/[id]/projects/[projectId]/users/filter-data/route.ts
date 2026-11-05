import { usersTaskFilterProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (!userProjectRole) {
        return apiErrorCustom("You are not authorised");
      }
      const tasks: usersTaskFilterProps[] = await prisma.task.findMany({
        where: {
          projectId,
          workspaceId,
        },
        select: {
          name: true,
          id: true,
        },
      });
      return Response.json({ tasks }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
