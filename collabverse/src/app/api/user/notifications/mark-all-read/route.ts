import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(async (user: User) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return Response.json({ success: true }, { status: 200 });
  } catch {
    return apiErrorCustom("Something went wrong");
  }
});
