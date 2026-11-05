import { withAuth } from "@/lib/api/auth/withAuth";
import { apiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }
      const userProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (
        userWsRole !== "Owner" &&
        userWsRole !== "Admin" &&
        !userProjectRole
      ) {
        return apiError("You are not authorised", 403);
      }

      return Response.json({ role: userProjectRole }, { status: 200 });
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
