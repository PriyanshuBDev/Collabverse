import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";
const themeSchema = z.object({
  theme: z.enum(["Dark", "Light", "Default"]),
});

export const PATCH = withAuth(async (user: User, req: Request) => {
  const data = await req.json();
  try {
    const { theme } = themeSchema.parse(data);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        theme,
      },
    });
    return Response.json({ success: true }, { status: 200 });
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
