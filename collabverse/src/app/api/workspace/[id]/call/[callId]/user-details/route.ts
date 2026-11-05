import { memberProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; callId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const callId = params.callId;
    if (!workspaceId || !callId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const callDetails = await prisma.callSession.findFirst({
        where: {
          id: callId,
          workspaceId,
        },
        select: {
          startedById: true,
        },
      });
      if (!callDetails || !callDetails.startedById) {
        return apiErrorCustom("Call not found");
      }
      const res = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: callDetails.startedById,
            workspaceId,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              username: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("User not found");
      }
      const remoteUser: memberProps = {
        id: res.user.id,
        name: res.user.name ?? "Unknown",
        avatar: res.user.avatar ?? undefined,
        username: res.user.username ?? "",
      };
      return Response.json({ user: remoteUser });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
