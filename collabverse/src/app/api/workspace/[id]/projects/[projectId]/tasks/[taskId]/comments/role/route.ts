import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;

    if (!workspaceId || !taskId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const membership = await prisma.taskMember.findFirst({
        where: {
          projectMemberUserId: user.id,
          workspaceId,
          projectId,
          taskId,
        },
        select: {
          role: true,
        },
      });
      return Response.json({ role: membership?.role ?? undefined });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
