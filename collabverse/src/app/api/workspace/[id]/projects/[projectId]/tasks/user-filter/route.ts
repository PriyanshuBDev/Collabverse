import { basicMember } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type prop = {
  workspaceMember: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
};
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
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const userProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
      }

      const projectUsers = await prisma.projectMember.findMany({
        where: {
          projectId,
          workspaceMemberWsId: workspaceId,
        },
        select: {
          workspaceMember: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
      const users: basicMember[] = projectUsers.map((u: prop) => ({
        id: u.workspaceMember.user.id,
        name: u.workspaceMember.user.name ?? "unknown",
        avatar: u.workspaceMember.user.avatar ?? undefined,
      }));
      return Response.json({ users }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
