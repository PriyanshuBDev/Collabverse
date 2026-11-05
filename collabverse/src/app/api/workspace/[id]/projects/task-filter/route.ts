import { dataWithSlug, taskFilterProjectProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type prop = {
  role: $Enums.PRole;
  project: {
    id: string;
    name: string;
    avatar: string | null;
    slug: string;
  };
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole === "Owner" || userWsRole === "Admin") {
        const res = await prisma.project.findMany({
          where: {
            workspaceId,
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        });
        const projects: taskFilterProjectProps[] = res.map(
          (r: dataWithSlug) => ({
            id: r.id,
            name: r.name,
            avatar: r.avatar ?? undefined,
            role: "High",
            slug: r.slug,
          }),
        );
        return Response.json({ projects }, { status: 200 });
      } else {
        const res = await prisma.projectMember.findMany({
          where: {
            workspaceMemberWsId: workspaceId,
            workspaceMemberUserId: user.id,
          },
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                avatar: true,
                slug: true,
              },
            },
          },
        });
        const projects: taskFilterProjectProps[] = res.map((p: prop) => {
          return {
            id: p.project.id,
            name: p.project.name,
            avatar: p.project.avatar ?? undefined,
            role: p.role,
            slug: p.project.slug,
          };
        });
        return Response.json({ projects }, { status: 200 });
      }
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
