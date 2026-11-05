import { notificationProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { parseActivityTarget } from "@/lib/functions/activity/parseActivityTarget";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ notificationId: string }> },
  ) => {
    const params = await paramsPromise;
    const notificationId = params.notificationId;
    if (!notificationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const n = await prisma.notification.findUnique({
        where: {
          id: notificationId,
        },

        select: {
          id: true,
          sender: {
            select: {
              name: true,
              id: true,
              avatar: true,
            },
          },
          target: true,
          meta: true,
          type: true,
          createdAt: true,
          workspace: {
            select: {
              id: true,
              name: true,
              avatar: true,
              slug: true,
            },
          },
        },
      });
      if (!n) {
        return apiErrorCustom("Notification not found");
      }

      const notification: notificationProps = {
        ...n,
        target: parseActivityTarget(n.target) ?? undefined,
        meta:
          typeof n.meta === "object" && n.meta !== null
            ? (n.meta as Record<string, string | undefined>)
            : undefined,
        sender: n.sender
          ? {
              id: n.sender.id,
              name: n.sender.name ?? "unknown",
              avatar: n.sender.avatar ?? undefined,
            }
          : {
              id: undefined,
              name: "Deleted user",
              avatar: "/assets/anonymous.webp",
            },
        workspace: n.workspace
          ? {
              ...n.workspace,
              avatar: n.workspace?.avatar ?? undefined,
            }
          : undefined,
      };

      return Response.json({ notification }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
