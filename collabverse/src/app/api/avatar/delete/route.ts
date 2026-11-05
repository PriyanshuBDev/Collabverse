import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { verifyOwnership } from "@/lib/serviceLayer/permission/edit/verifyOwnership";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

const avatarDeleteSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("users"),
    path: z.string(),
  }),
  z.object({
    type: z.literal("groups"),
    typeId: z.uuid(),
    path: z.string(),
  }),
  z.object({
    type: z.literal("projects"),
    typeId: z.uuid(),
    workspaceId: z.uuid(),
    path: z.string(),
  }),
  z.object({
    type: z.literal("workspaces"),
    typeId: z.uuid(),
    path: z.string(),
  }),
]);

export const POST = withAuth(async (user: User, req: Request) => {
  const supabase = supabaseAdmin();
  try {
    const body = avatarDeleteSchema.parse(await req.json());
    const res = await verifyOwnership(
      body.type,
      user.id,
      "typeId" in body ? body.typeId : undefined,
      "workspaceId" in body ? body.workspaceId : undefined,
    );
    if (!res) {
      return new Response("You are not authorized", {
        status: 403,
      });
    }
    switch (body.type) {
      case "users":
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: null, avatarPath: null },
        });
        break;

      case "groups":
        await prisma.conversation.update({
          where: { id: body.typeId },
          data: { avatar: null, avatarPath: null },
        });
        break;

      case "projects":
        await prisma.project.update({
          where: { id: body.typeId, workspaceId: body.workspaceId },
          data: { avatar: null, avatarPath: null },
        });
        break;

      case "workspaces":
        await prisma.workspace.update({
          where: { id: body.typeId },
          data: { avatar: null, avatarPath: null },
        });
        break;
    }
    try {
      if (body.type === "projects") {
        await prisma.activity.create({
          data: {
            projectId: body.typeId,
            workspaceId: body.workspaceId,
            type: "project_avatar_updated",
            actorUserId: user.id,
          },
        });
      }
      if (body.type === "workspaces") {
        await prisma.activity.create({
          data: {
            workspaceId: body.typeId,
            actorUserId: user.id,
            type: "workspace_avatar_updated",
          },
        });
      }
    } catch (e) {
      console.log("Failed to log activity", e);
    }
    const { error } = await supabase.storage
      .from("Avatars")
      .remove([body.path]);
    if (error) {
      console.log(error);
      return new Response(`Failed to delete avatar`, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (e) {
    console.log(e);
    if (e instanceof ZodError) {
      return Response.json(
        { errors: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return new Response(`Something went wrong `, { status: 500 });
  }
});
