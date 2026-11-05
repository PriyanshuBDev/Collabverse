import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const FileTypeEnumSchema = z.enum([
  "image/jpeg",
  "image/svg+xml",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "text/plain",
  "text/csv",
  "application/pdf",
  "application/json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
]);
type attachProp = {
  originalName: string;
  fileName: string;
  path: string;
  type: z.infer<typeof FileTypeEnumSchema>;
  size: number;
  format: string;
};
export const createAttachmentSchema = z.object({
  files: z.array(
    z.object({
      originalName: z.string(),
      fileName: z.string(),
      path: z.string(),
      type: FileTypeEnumSchema,
      size: z.coerce
        .number()
        .min(1)
        .max(50 * 1024 * 1024),
      format: z.string(),
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
      const { files } = createAttachmentSchema.parse(body);
      if (files.length > 10) {
        return apiError(
          "Cannot upload more than 10 attachments at a time",
          400,
        );
      }
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const task = await prisma.task.findFirst({
        where: {
          workspaceId,
          projectId,
          id: taskId,
        },
        select: {
          id: true,
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      await prisma.attachment.createMany({
        data: files.map((f: attachProp) => ({
          ...f,
          taskId,
          attachedById: user.id,
        })),
      });
      try {
        await prisma.activity.create({
          data: {
            actorUserId: user.id,
            workspaceId,
            projectId,
            taskId,
            type: "task_attachment_added",
            meta: {
              count: files.length,
            },
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      console.log(e);
      return zodApiError(e);
    }
  },
);
