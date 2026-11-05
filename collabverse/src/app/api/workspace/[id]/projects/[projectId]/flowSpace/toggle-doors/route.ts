import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, Doors } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const toggleDoorSchema = z.object({
  doorId: z.enum(Doors),
  enabled: z.boolean(),
});
export const PATCH = withAuth(
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
    const data = await req.json();
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const { doorId, enabled } = toggleDoorSchema.parse(data);

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
      const alreadyEnabled = res.openDoors.includes(doorId);
      if (enabled !== alreadyEnabled) {
        const updatedOpenDoors = enabled
          ? Array.from(new Set([...res.openDoors, doorId]))
          : res.openDoors.filter((o: $Enums.Doors) => o !== doorId);
        await prisma.flowSpace.update({
          where: {
            id: res.id,
          },
          data: {
            openDoors: {
              set: updatedOpenDoors,
            },
          },
        });
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
