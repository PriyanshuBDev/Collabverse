import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { task_assigned_notifiation } from "@/lib/functions/notifications/notifications";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, TaskRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type userProp = {
  id: string;
  role: "Assignee" | "Reviewer";
};
type wsRoleId = {
  role: $Enums.PRole;
  workspaceMemberUserId: string;
};
const assignUsersSchema = z.object({
  users: z.array(
    z.object({
      id: z.string().uuid({ message: "Invalid id" }),
      role: z.enum(TaskRole),
    }),
  ),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { users } = assignUsersSchema.parse(body);
      if (users.length === 0) {
        return apiErrorCustom("Invalid data");
      }
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (
          !userProjectRole ||
          (userProjectRole !== "Owner" && userProjectRole !== "Manager")
        ) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          projectId,
          workspaceId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          project: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      const userIds = users.map((u: userProp) => u.id);
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          workspaceMemberUserId: {
            in: userIds,
          },
          workspaceMemberWsId: workspaceId,
          projectId,
        },
        select: {
          workspaceMemberUserId: true,
          role: true,
        },
      });

      const validIds = projectMembers
        .filter((p: wsRoleId) => p.role !== "Viewer")
        .map((p: wsRoleId) => p.workspaceMemberUserId);
      const invalidIds = userIds.filter((u: string) => !validIds.includes(u));
      if (userIds.length === invalidIds.length) {
        return apiError(
          "You can only assign project users (except viewer)",
          400,
        );
      }
      const filteredUsers = users.filter((u: userProp) =>
        validIds.includes(u.id),
      );
      await prisma.taskMember.createMany({
        data: filteredUsers.map((u: userProp) => ({
          workspaceId,
          projectId,
          taskId,
          role: u.role,
          projectMemberUserId: u.id,
        })),
      });
      try {
        await prisma.activity.createMany({
          data: filteredUsers.map((u: userProp) => ({
            workspaceId,
            projectId,
            taskId,
            type: "task_member_added",
            actorUserId: user.id,
            affectedUserId: u.id,
            meta: {
              role: u.role,
            },
          })),
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }

      await task_assigned_notifiation(
        filteredUsers,
        user.id,
        workspaceId,
        task.id,
        task.name,
        task.slug,
        task.project.name,
        task.project.slug,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
