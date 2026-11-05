import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(async (user: User) => {
  try {
    const res = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        mute: true,
      },
    });
    if (!res) {
      return new Response("User not found", { status: 404 });
    }
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        mute: !res.mute,
      },
    });
    return Response.json({ msg: "Successfully toggled mute" }, { status: 200 });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
});
