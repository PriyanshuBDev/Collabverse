import { withAuth } from "@/lib/api/auth/withAuth";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { nameSchema } from "../../create/route";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { project_due_date_changed_notification } from "@/lib/functions/notifications/notifications";
type workspaceMemberIdProp = {
  workspaceMemberUserId: string;
};
export const projectPatchSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const PATCH = withAuth(
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
    const data = await req.json();
    try {
      const { name, dueDate, description } = projectPatchSchema.parse(data);
      if (dueDate !== undefined && dueDate !== null) {
        if (dueDate <= new Date(Date.now() + 1000)) {
          return apiErrorCustom("Due date must be in the future");
        }
      }
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          workspaceId,
        },
        select: {
          name: true,
          dueDate: true,
          description: true,
          slug: true,
          roles: {
            where: {
              role: "Manager",
            },
            select: {
              role: true,
              permissions: true,
            },
          },
          members: {
            where: {
              workspaceMemberUserId: user.id,
              workspaceMemberWsId: workspaceId,
            },
            select: {
              role: true,
            },
          },
        },
      });
      if (!project) {
        return apiError("Project not found", 404);
      }
      const userProjectRole = project.members[0]?.role;
      const managerPermToEdit =
        project.roles[0]?.permissions.includes("Edit_Project_Details") ?? false;
      if (
        userWsRole !== "Admin" &&
        userWsRole !== "Owner" &&
        !userProjectRole
      ) {
        return apiError("You are not authorised", 403);
      }
      if (
        userProjectRole !== "Owner" &&
        !(userProjectRole === "Manager" && managerPermToEdit)
      ) {
        return apiError("You are not authorised", 403);
      }
      const nameCheck = name !== undefined && name !== project.name;
      const descriptionCheck =
        description !== undefined && description !== project.description;
      const dueDateCheck =
        dueDate !== undefined &&
        !(
          (dueDate === null && project.dueDate === null) ||
          (dueDate instanceof Date &&
            project.dueDate instanceof Date &&
            new Date(dueDate).getTime() === new Date(project.dueDate).getTime())
        );
      if (!nameCheck && !descriptionCheck && !dueDateCheck) {
        return apiError("No actaual data provided", 400);
      }
      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          ...(nameCheck && { name }),
          ...(descriptionCheck && { description }),
          ...(dueDateCheck && { dueDate }),
        },
      });
      let errors;
      try {
        const activities: Prisma.ActivityCreateManyInput[] = [];
        if (nameCheck) {
          activities.push({
            workspaceId,
            projectId,
            type: "project_name_updated",
            actorUserId: user.id,
            target: {
              oldValue: project.name,
              newValue: name,
            },
          });
        }
        if (descriptionCheck) {
          activities.push({
            workspaceId,
            projectId,
            type: "project_description_updated",
            actorUserId: user.id,
          });
        }
        if (dueDateCheck) {
          activities.push({
            workspaceId,
            projectId,
            type: "project_due_updated",
            actorUserId: user.id,
            target: {
              oldValue: project.dueDate ?? "No due date",
              newValue: dueDate ?? "No due date",
            },
          });
        }
        if (activities.length > 0) {
          await prisma.activity.createMany({
            data: activities,
          });
        }
      } catch (e) {
        console.log("Failed to log activity", e);
      }
      try {
        if (dueDateCheck) {
          const memberIds = (
            await prisma.projectMember.findMany({
              where: {
                projectId,
                workspaceMemberWsId: workspaceId,
                workspaceMemberUserId: {
                  not: user.id,
                },
              },
              select: {
                workspaceMemberUserId: true,
              },
            })
          ).map((m: workspaceMemberIdProp) => m.workspaceMemberUserId);

          await project_due_date_changed_notification(
            memberIds,
            user.id,
            workspaceId,
            projectId,
            project.slug,
            project.name,
            project.dueDate ?? undefined,
            dueDate ?? undefined,
          );
        }
      } catch (e) {
        console.log("Failed to log notification", e);
      }
      return Response.json({ success: true, errors }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
