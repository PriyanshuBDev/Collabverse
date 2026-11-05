import { memberProps, prismaProMemProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.taskMember.findMany({
        where: {
          taskId,
          projectId,
          workspaceId,
        },
        select: {
          projectMember: {
            select: {
              workspaceMember: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const members: memberProps[] = res.map((m: prismaProMemProp) => {
        const user = m.projectMember.workspaceMember.user;
        return {
          id: user.id,
          name: user.name ?? "unknown",
          avatar: user.avatar ?? undefined,
          username: user.username ?? "unknown",
        };
      });
      return Response.json({ members });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
