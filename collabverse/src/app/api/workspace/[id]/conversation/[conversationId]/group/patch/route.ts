import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { nameSchema } from "@/lib/functions/route/nameSchema";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";

const groupPatchSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const { name, description } = groupPatchSchema.parse(data);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const currentUserGroup = await prisma.conversationMember.findFirst({
        where: {
          conversation: {
            type: "Group",
          },
          workspaceId,
          conversationId,
          userId: user.id,
          status: "Active",
          kickedAt: null,
          deletedAt: null,
          leftAt: null,
        },
        select: {
          role: true,
          conversation: {
            select: {
              name: true,
              description: true,
              groupPermissions: {
                select: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
      if (
        !currentUserGroup ||
        (currentUserGroup.role === "Member" &&
          !currentUserGroup.conversation.groupPermissions?.permissions.includes(
            "Edit_Group_Details",
          ))
      ) {
        return apiErrorCustom("You are not authorised");
      }
      const nameCheck =
        name !== undefined && name !== currentUserGroup.conversation.name;
      const descriptionCheck =
        description !== undefined &&
        description !== currentUserGroup.conversation.description;
      if (!nameCheck && !descriptionCheck) {
        return apiErrorCustom("No actaual data provided");
      }
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          ...(nameCheck && { name }),
          ...(descriptionCheck && { description }),
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
