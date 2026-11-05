import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { Priority, TaskRole, TaskStatus } from "@prisma/client";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { prisma } from "@/lib/db/prisma";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { createTaskService } from "@/lib/serviceLayer/task/createTaskService";
import { nameSchema } from "@/lib/functions/route/nameSchema";

const createTaskSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
  status: z.enum(TaskStatus),
  priority: z.enum(Priority),
  dueDate: z.coerce.date(),
  users: z
    .array(
      z.object({
        id: z.string().uuid({ message: "Invalid id" }),
        role: z.enum(TaskRole),
      }),
    )
    .optional(),
});

export const POST = withAuth(
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
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { name, status, priority, description, dueDate, users } =
        createTaskSchema.parse(body);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          name: true,
        },
      });
      if (!project) {
        return apiErrorCustom("Project not found");
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
      if (dueDate <= new Date()) {
        return apiErrorCustom("Due date must be in the future");
      }
      const res = await createTaskService(
        user.id,
        workspaceId,
        projectId,
        name,
        status,
        priority,
        dueDate,
        description,
        users,
      );
      return Response.json({ slug: res.slug, id: res.id }, { status: 200 });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
