import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        data: {
          lastSeenAt: new Date(),
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
