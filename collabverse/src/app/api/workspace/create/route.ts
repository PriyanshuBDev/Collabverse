import { withAuth } from "@/lib/api/auth/withAuth";
import { nameSchema } from "@/lib/functions/route/nameSchema";

import { createWorkspaceService } from "@/lib/serviceLayer/workspace/createWorkspaceService";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";
const wsCreateSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
});
export const POST = withAuth(async (user: User, req: Request) => {
  const data = await req.json();

  try {
    const { name, description } = wsCreateSchema.parse(data);
    const res = await createWorkspaceService(user.id, name, description);
    return Response.json(res, { status: 200 });
  } catch (e) {
    if (e instanceof ZodError) {
      return Response.json(
        { errors: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return new Response("Something went wrong", { status: 500 });
  }
});
