import { projInviteRolesConst } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { findPermission } from "@/lib/functions/workspace/findPermission";
import { createProjectService } from "@/lib/serviceLayer/project/createProjectService";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const nameSchema = z
  .string()
  .min(6, "Name must be atleast 6 characters")
  .max(25, "Name must be at most 25 characters")
  .refine((val) => !val.startsWith(" "), {
    message: "Name cannot start with a space",
  })
  .refine((val) => !val.includes("   "), {
    message: "Name cannot contain triple spaces",
  })
  .regex(/^[\p{L}\p{N}\p{Emoji_Presentation}\s._-]+$/u, {
    message: "Name contains invalid characters",
  });
export const projectCreateSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
  users: z
    .array(
      z.object({
        id: z.string().uuid({ message: "Invalid id" }),
        role: z.enum(projInviteRolesConst),
      }),
    )
    .optional(),
});

export const POST = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const currentUser = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
      select: {
        role: true,
        workspace: {
          select: {
            roles: {
              select: {
                permissions: true,
                role: true,
              },
            },
          },
        },
      },
    });
    const memberPermToCreate = findPermission({
      roles: currentUser?.workspace.roles,
      role: "Member",
      permission: "Create_Project",
    });
    const adminPermToCreate = findPermission({
      roles: currentUser?.workspace.roles,
      role: "Admin",
      permission: "Create_Project",
    });
    if (
      !currentUser ||
      (currentUser.role === "Admin" && !adminPermToCreate) ||
      (currentUser.role === "Member" && !memberPermToCreate)
    ) {
      return apiErrorCustom("You are not authorised");
    }
    const data = await req.json();
    try {
      const { name, description, dueDate, users } =
        projectCreateSchema.parse(data);
      if (dueDate && dueDate <= new Date()) {
        return apiErrorCustom("Due date must be in the future");
      }
      const res = await createProjectService(
        user.id,
        workspaceId,
        name,
        description,
        dueDate,
        users,
      );

      return Response.json({ slug: res.slug, id: res.id }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
