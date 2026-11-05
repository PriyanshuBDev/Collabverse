import {
  pathProp,
  projMemberUserIdProp,
  wsMemberUserIdProp,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }

    try {
      const supabase = supabaseAdmin();
      const currentUserWsRole = await wsRole(user.id, workspaceId);

      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const currentUserProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      const canDelete =
        currentUserWsRole === "Owner" ||
        currentUserWsRole === "Admin" ||
        currentUserProjectRole === "Owner" ||
        currentUserProjectRole === "Manager";

      if (!canDelete) {
        return apiErrorCustom("You are not authorised");
      }

      const res = await prisma.task.findFirst({
        where: {
          id: taskId,
          workspaceId,
          projectId,
        },
        select: {
          attachments: {
            select: {
              path: true,
            },
          },
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
          name: true,
          members: {
            select: {
              projectMemberUserId: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Task not found");
      }
      const attachmentPaths: string[] = [];
      res.attachments.forEach((a: pathProp) => {
        attachmentPaths.push(a.path);
      });
      if (attachmentPaths.length > 0) {
        const { error } = await supabase.storage
          .from("Attachments")
          .remove(attachmentPaths);
        console.error(error);
      }

      await prisma.task.delete({
        where: { id: taskId },
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            target: {
              name: res.name,
            },
            actorUserId: user.id,
            type: "task_deleted",
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      try {
        const usersToNotify = new Set<string>();
        const projectHighers = await prisma.projectMember.findMany({
          where: {
            workspaceMemberUserId: {
              not: user.id,
            },
            role: {
              in: ["Manager", "Owner"],
            },
          },
          select: {
            workspaceMemberUserId: true,
          },
        });
        projectHighers.forEach((w: wsMemberUserIdProp) =>
          usersToNotify.add(w.workspaceMemberUserId),
        );
        res.members.forEach((m: projMemberUserIdProp) =>
          usersToNotify.add(m.projectMemberUserId),
        );
        await prisma.notification.createMany({
          data: [...usersToNotify].map((u: string) => ({
            userId: u,
            type: "task_deleted",
            workspaceId,
            senderId: user.id,
            target: {
              name: res.name,
            },
            meta: {
              projectSlug: res.project.slug,
              projectName: res.project.name,
            },
          })),
        });
      } catch (e) {
        console.error("Failed to create notificaions", e);
      }
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
