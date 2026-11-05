import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { verifyAndReturnPath } from "@/lib/serviceLayer/avatar/verifyAndReturnPath";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";
import { z, ZodError } from "zod";

const avatarSchema = z.object({
  id: z.string().uuid({ message: "Invalid id" }),
  workspaceId: z.string().uuid({ message: "Invalid id" }).optional(),
  type: z.enum(["users", "groups", "projects", "workspaces"]),
  path: z.string(),
});
export const POST = withAuth(async (user: User, req: Request) => {
  const body = await req.json();
  const supabase = supabaseAdmin();

  try {
    const { id, type, path, workspaceId } = avatarSchema.parse(body);
    if (type === "users" && user.id !== id) {
      return new Response("Forbidden", { status: 403 });
    }
    const res = await verifyAndReturnPath(type, user.id, id, workspaceId);
    if (!res.permission) {
      return new Response("You are not authorized", {
        status: 403,
      });
    }
    const url = supabase.storage.from("Avatars").getPublicUrl(path)
      .data.publicUrl;
    switch (type) {
      case "users":
        await prisma.user.update({
          where: { id },
          data: { avatar: url, avatarPath: path },
        });
        break;

      case "groups":
        await prisma.conversation.update({
          where: { id },
          data: { avatar: url, avatarPath: path },
        });
        break;

      case "projects":
        await prisma.project.update({
          where: { id },
          data: { avatar: url, avatarPath: path },
        });
        break;

      case "workspaces":
        await prisma.workspace.update({
          where: { id },
          data: { avatar: url, avatarPath: path },
        });
        break;
    }
    try {
      if (type === "projects") {
        await prisma.activity.create({
          data: {
            projectId: id,
            workspaceId: workspaceId,
            type: "project_avatar_updated",
            actorUserId: user.id,
          },
        });
      }
      if (type === "workspaces") {
        await prisma.activity.create({
          data: {
            workspaceId: id,
            actorUserId: user.id,
            type: "workspace_avatar_updated",
          },
        });
      }
    } catch (e) {
      console.log("Failed to log activity", e);
    }
    if (res.path) {
      await supabase.storage.from("Avatars").remove([res.path]);
    }
    return Response.json({ avatar: url, avatarPath: path }, { status: 200 });
  } catch (e) {
    if (e instanceof ZodError) {
      return Response.json(
        { errors: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return new Response(`Something went wrong`, { status: 500 });
  }
});
