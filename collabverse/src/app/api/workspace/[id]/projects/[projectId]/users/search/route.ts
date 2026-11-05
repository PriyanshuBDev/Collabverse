import { ProjectMembersProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type userProp = {
  role: $Enums.PRole;
  workspaceMember: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const mode = searchParams.get("mode");
    if (!workspaceId || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    if (!search) return Response.json({ users: [] }, { status: 200 });
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const take = 5;
      const res = await prisma.projectMember.findMany({
        where: {
          projectId,
          ...(mode === "assignable" && { role: { not: "Viewer" } }),
          workspaceMember: {
            user: search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { username: { contains: search, mode: "insensitive" } },
                  ],
                }
              : undefined,
          },
        },
        orderBy: {
          workspaceMember: {
            user: {
              name: "asc",
            },
          },
        },
        take,
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
          role: true,
        },
      });
      const users: ProjectMembersProps[] = res.map((u: userProp) => ({
        id: u.workspaceMember.user.id,
        name: u.workspaceMember.user.name ?? "unknown",
        avatar: u.workspaceMember.user.avatar ?? undefined,
        username: u.workspaceMember.user.username ?? "unknown",
        role: u.role,
      }));
      return Response.json({ users }, { status: 200 });
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
