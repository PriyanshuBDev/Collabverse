import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        profileCompleted: true,
      },
    });
    return Response.json(
      { id: user.id, profileCompleted: currentUser?.profileCompleted ?? false },
      { status: 200 },
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response("Error encountered", { status: 500 });
  }
});
