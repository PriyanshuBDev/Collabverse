import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User) => {
  try {
    const res = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        avatar: true,
        name: true,
        username: true,
        mute: true,
        theme: true,
      },
    });
    if (!res) {
      return new Response("User not found", { status: 404 });
    }
    return Response.json(res, { status: 200 });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
});
