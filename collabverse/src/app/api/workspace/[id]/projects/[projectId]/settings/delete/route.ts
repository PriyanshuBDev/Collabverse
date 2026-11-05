import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { project_deleted_notification } from "@/lib/functions/notifications/notifications";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type pathProp = {
  path: string;
};
type wsMemberIdRole = {
  role: $Enums.PRole;
  workspaceMemberUserId: string;
};
type attachProp = {
  attachments: {
    path: string;
  }[];
};
export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    const supabase = supabaseAdmin();
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          avatarPath: true,
          name: true,
          tasks: {
            select: {
              attachments: {
                select: {
                  path: true,
                },
              },
            },
          },
          workspace: {
            select: {
              name: true,
              id: true,
            },
          },
          members: {
            select: {
              workspaceMemberUserId: true,
              role: true,
            },
          },
        },
      });
      if (!project || project.workspace.id !== workspaceId) {
        return apiError("Project not found", 404);
      }
      const userProjectRole = project.members.find(
        (m: wsMemberIdRole) => m.workspaceMemberUserId === user.id,
      )?.role;
      const allowed =
        userWsRole === "Owner" ||
        userWsRole === "Admin" ||
        userProjectRole === "Owner";
      if (!allowed) {
        return apiError("You are not authorised", 403);
      }
      const deleteStorage = async () => {
        try {
          if (project.avatarPath) {
            await supabase.storage.from("Avatars").remove([project.avatarPath]);
          }
          const attachmentPaths = project.tasks.flatMap((t: attachProp) =>
            t.attachments.map((a: pathProp) => a.path),
          );
          if (attachmentPaths.length > 0) {
            const chunkSize = 1000;

            for (let i = 0; i < attachmentPaths.length; i += chunkSize) {
              const chunk = attachmentPaths.slice(i, i + chunkSize);
              await supabase.storage.from("Attachments").remove(chunk);
            }
          }
        } catch (e) {
          console.error("Storage deletion failed", e);
        }
      };
      const logActivity = async () => {
        try {
          await prisma.activity.create({
            data: {
              workspaceId,
              type: "project_deleted",
              actorUserId: user.id,
            },
          });
        } catch (e) {
          console.error("Activity logging failed", e);
        }
      };
      const sendNotifications = async () => {
        try {
          const memberIds = project.members
            .filter((m: wsMemberIdRole) => m.workspaceMemberUserId !== user.id)
            .map((m: wsMemberIdRole) => m.workspaceMemberUserId);
          if (memberIds.length === 0) return;
          await project_deleted_notification(
            memberIds,
            workspaceId,
            user.id,
            project.name,
          );
        } catch (e) {
          console.error("Notification logging failed", e);
        }
      };
      await prisma.project.delete({
        where: {
          id: projectId,
          workspaceId,
        },
      });

      await Promise.allSettled([
        deleteStorage(),
        logActivity(),
        sendNotifications(),
      ]);
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
