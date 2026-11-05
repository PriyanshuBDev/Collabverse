import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, GroupPerm } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const groupPermToggleSchema = z.object({
  permission: z.enum(GroupPerm),
  enabled: z.boolean(),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; conversationId: string } },
  ) => {
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const { permission, enabled } = groupPermToggleSchema.parse(data);
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
              groupPermissions: {
                select: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
      if (!currentUserGroup || currentUserGroup.role === "Member") {
        return apiErrorCustom("You are not authorised");
      }
      const permissions =
        currentUserGroup.conversation.groupPermissions?.permissions ?? [];
      const alreadyEnabled = permissions.includes(permission);
      if (enabled === alreadyEnabled) {
        return apiError(
          `${permission} already ${enabled ? "enabled" : "disabled"}`,
          400,
        );
      }
      const updatedPerm = enabled
        ? Array.from(new Set([...permissions, permission]))
        : permissions.filter((p: $Enums.GroupPerm) => p !== permission);
      await prisma.groupPermission.update({
        where: {
          conversationId,
        },
        data: {
          permissions: {
            set: updatedPerm,
          },
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
