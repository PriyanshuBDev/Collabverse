import { withAuth } from "@/lib/api/auth/withAuth";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { nameSchema } from "../../projects/create/route";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";

export const editWsSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
});
export const PATCH = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { name, description } = editWsSchema.parse(body);
      if (name === undefined && description === undefined) {
        return apiErrorCustom("Invalid data");
      }
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const ws = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          name: true,
          description: true,
        },
      });
      if (!ws) {
        return apiErrorCustom("Workspace not found");
      }
      const nameCheck = name !== undefined && name !== ws.name;
      const descriptionCheck =
        description !== undefined && description !== ws.description;
      if (!nameCheck && !descriptionCheck) {
        return apiError("No actaual data provided", 400);
      }
      await prisma.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          ...(nameCheck && { name }),
          ...(descriptionCheck && { description }),
        },
      });
      try {
        const activities: Prisma.ActivityCreateManyInput[] = [];

        if (nameCheck) {
          activities.push({
            workspaceId,
            actorUserId: user.id,
            type: "workspace_name_updated",
            target: {
              oldValue: ws.name,
              newValue: name,
            },
          });
        }
        if (descriptionCheck) {
          activities.push({
            workspaceId,
            actorUserId: user.id,
            type: "workspace_description_updated",
            target: {
              name: ws.name,
            },
          });
        }

        if (activities.length > 0) {
          await prisma.activity.createMany({
            data: activities,
          });
        }
      } catch (e) {
        console.error("Failed to log activity", e);
      }

      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
