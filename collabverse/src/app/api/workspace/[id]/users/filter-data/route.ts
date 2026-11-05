import { usersProjFilterProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  id: string;
  name: string;
  avatar: string | null;
  tasks: {
    id: string;
    name: string;
  }[];
};
type proProp = {
  id: string;
  name: string;
  avatar: string | null;
  members: {
    role: $Enums.PRole;
  }[];
  roles: {
    permissions: $Enums.PPermission[];
  }[];
  tasks: {
    id: string;
    name: string;
  }[];
};
export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiError("Invalid parameters", 400);
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return apiError("You are not authorised", 403);
      }
      if (role === "Owner" || role === "Admin") {
        const res = await prisma.project.findMany({
          where: {
            workspaceId,
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            tasks: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const data: usersProjFilterProps[] =
          res?.map((r: resProp) => ({ ...r, avatar: r.avatar ?? undefined })) ??
          [];
        return Response.json({ data }, { status: 200 });
      } else {
        const projectsData = await prisma.project.findMany({
          where: {
            workspaceId,
            members: {
              some: {
                workspaceMemberUserId: user.id,
              },
            },
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            roles: {
              where: {
                role: "Manager",
              },
              select: {
                permissions: true,
              },
            },
            tasks: {
              where: {
                members: {
                  some: {
                    projectMemberUserId: user.id,
                  },
                },
              },
              select: {
                id: true,
                name: true,
              },
            },
            members: {
              where: {
                workspaceMemberUserId: user.id,
              },
              select: {
                role: true,
              },
            },
          },
        });
        const data: usersProjFilterProps[] = projectsData.map((p: proProp) => ({
          ...p,
          avatar: p.avatar ?? undefined,
          role: p.members[0]?.role ?? undefined,
          managerPerms: p.roles[0]?.permissions ?? undefined,
        }));
        return Response.json({ data }, { status: 200 });
      }
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
