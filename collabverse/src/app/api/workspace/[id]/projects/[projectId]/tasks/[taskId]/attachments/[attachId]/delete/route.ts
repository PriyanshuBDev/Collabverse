import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{
        id: string;
        projectId: string;
        taskId: string;
        attachId: string;
      }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const attachmentId = params.attachId;
    if (!workspaceId || !projectId || !taskId || !attachmentId) {
      return apiErrorCustom("Invalid parameters");
    }
    const supabase = supabaseAdmin();
    try {
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.attachment.findFirst({
        where: {
          id: attachmentId,
          taskId,
        },
        select: {
          originalName: true,
          path: true,
        },
      });
      if (!res) {
        return apiError("Attachment not found", 404);
      }
      await prisma.attachment.delete({
        where: {
          id: attachmentId,
        },
      });
      const { error } = await supabase.storage
        .from("Attachments")
        .remove([res.path]);
      if (error) {
        return apiError("Failed to delete attachment from supabase", 500);
      }
      try {
        await prisma.activity.create({
          data: {
            actorUserId: user.id,
            workspaceId,
            projectId,
            taskId,
            type: "task_attachment_deleted",
            target: {
              name: res.originalName,
            },
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
