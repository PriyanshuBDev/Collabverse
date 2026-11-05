import { withAuth } from "@/lib/api/auth/withAuth";
import { verifyOwnership } from "@/lib/serviceLayer/permission/edit/verifyOwnership";
import { User } from "@supabase/supabase-js";
import z from "zod";

const schema = z.object({
  id: z.string().uuid({ message: "Invalid id" }),
  workspaceId: z.string().uuid({ message: "Invalid id" }).optional(),
  type: z.enum(["users", "groups", "projects", "workspaces"]),
});
export const POST = withAuth(async (user: User, req: Request) => {
  try {
    const { id, type, workspaceId } = schema.parse(await req.json());
    const isAllowed = await verifyOwnership(type, user.id, id, workspaceId);
    if (!isAllowed) {
      return new Response("You are not authorized", { status: 403 });
    }
    return Response.json({ success: true });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
});
