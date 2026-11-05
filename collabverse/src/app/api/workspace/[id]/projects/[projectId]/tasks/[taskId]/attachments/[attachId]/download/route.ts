import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
        taskId: string;
        attachId: string;
      };
    },
  ) => {
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
          path: true,
        },
      });
      if (!res) {
        return apiError("Attachment not found", 404);
      }
      const { data, error } = await supabase.storage
        .from("Attachments")
        .createSignedUrl(res.path, 180);
      if (error) {
        return apiError("Failed to generate signed url for attachment", 500);
      }

      return Response.json({ url: data.signedUrl }, { status: 200 });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
