import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { addUsersToGroupService } from "@/lib/serviceLayer/conversation/addUsersToGroupService";
import { groupRole } from "@/lib/serviceLayer/conversation/groupRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { GroupRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";

const addUsersToGroupSchema = z.object({
  users: z.array(
    z.object({
      id: z.uuid(),
      role: z.enum([GroupRole.Admin, GroupRole.Member]),
    }),
  ),
});
export const POST = withAuth(
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
      const { users } = addUsersToGroupSchema.parse(data);
      if (users.length === 0) {
        return apiErrorCustom("Invalid data");
      }
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const role = await groupRole(workspaceId, conversationId, user.id);
      if (!role) {
        return apiErrorCustom("You are not authorised");
      }
      if (role === "Member") {
        return apiErrorCustom("You are not authorised");
      }
      await addUsersToGroupService({
        workspaceId,
        users,
        conversationId,
        strict: true,
      });
      return Response.json({ success: true });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
