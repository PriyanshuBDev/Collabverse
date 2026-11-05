import { activityProps, userIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { activityBuilder } from "@/lib/serviceLayer/activity/activityBuilder";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: {
      params: {
        id: string;
        projectId: string;
        activityId: string;
      };
    },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const activityId = params.activityId;
    if (!workspaceId || !projectId || !activityId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole !== "Admin" && userWsRole !== "Owner") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const res = await prisma.activity.findFirst({
        where: {
          id: activityId,
          projectId,
        },
        select: {
          id: true,
          target: true,
          meta: true,
          type: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          affectedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Activtiy not found");
      }
      const userIds = new Set<string>();
      if (res.actor?.id) {
        userIds.add(res.actor.id);
      }
      if (res.affectedUser?.id) {
        userIds.add(res.affectedUser.id);
      }
      const members = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: {
            in: [...userIds],
          },
        },
        select: {
          userId: true,
        },
      });
      const memberSet = new Set(members.map((m: userIdProp) => m.userId));
      const activity: activityProps = activityBuilder({
        memberSet,
        workspaceId,
        activitySelect: res,
        projectId,
      });
      return Response.json({ activity }, { status: 200 });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
