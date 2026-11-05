import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User, req: Request) => {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  try {
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
        ...(workspaceId !== null && { workspaceId }),
      },
    });
    return Response.json({ count }, { status: 200 });
  } catch {
    return apiErrorCustom("Something went wrong");
  }
});
