import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
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
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }

      const memberShip = await projectRole(user.id, workspaceId, projectId);
      if (!memberShip) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.flowSpace.findFirst({
        where: {
          projectId,
        },
        select: {
          id: true,
          openDoors: true,
        },
      });
      if (!res) {
        return apiErrorCustom("FlowSpace not found");
      }

      return Response.json({ openDoors: res.openDoors });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
