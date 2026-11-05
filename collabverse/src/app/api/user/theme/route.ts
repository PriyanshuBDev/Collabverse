import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User) => {
  try {
    const res = await prisma.user.findFirst({
      where: { id: user.id },
      select: {
        theme: true,
      },
    });
    if (!res) {
      return new Response("User not found", { status: 404 });
    }
    return Response.json({ theme: res.theme }, { status: 200 });
  } catch (e) {
    console.log(e);
    return new Response("Something went wrong", { status: 500 });
  }
});
