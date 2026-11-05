import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { notificationId: string } },
  ) => {
    const notificationId = params.notificationId;
    if (!notificationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
          read: false,
        },
        select: {
          id: true,
        },
      });
      if (!notification) {
        return apiErrorCustom("Notification not found");
      }
      await prisma.notification.update({
        where: {
          id: notificationId,
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
  },
);
