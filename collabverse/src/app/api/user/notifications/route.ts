import { notificationProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { parseActivityTarget } from "@/lib/functions/activity/parseActivityTarget";
import { zodApiError } from "@/lib/functions/error/apiError";
import { $Enums } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type rowProps = {
  id: string;
  createdAt: Date;
  workspace: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
  } | null;
  type: $Enums.NotificationType;
  target: JsonValue;
  meta: JsonValue;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
};
export const getNotificationsSchema = z.object({
  cursorId: z.uuid().optional(),
  cursorCreatedAt: z.coerce.date().optional(),
  workspaceId: z.uuid().optional(),
});
export const GET = withAuth(async (user: User, req: Request) => {
  const { searchParams } = new URL(req.url);
  const queryObj = Object.fromEntries(searchParams.entries());
  const PAGE_SIZE = 30;
  try {
    const { cursorCreatedAt, cursorId, workspaceId } =
      getNotificationsSchema.parse(queryObj);
    const rows = await prisma.notification.findMany({
      where: {
        userId: user.id,
        read: false,
        ...(workspaceId !== undefined && { workspaceId }),
        ...(cursorCreatedAt && cursorId
          ? {
              OR: [
                {
                  createdAt: {
                    lt: new Date(cursorCreatedAt),
                  },
                },
                {
                  createdAt: new Date(cursorCreatedAt),
                  id: {
                    lt: cursorId,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE + 1,
      skip: cursorId && cursorCreatedAt ? 1 : 0,
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
    const hasMore = rows.length > PAGE_SIZE;
    const requiredRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    const notifications: notificationProps[] = requiredRows.map(
      (n: rowProps) => ({
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
      }),
    );
    const last =
      notifications.length > 0 ? notifications[notifications.length - 1] : null;
    const nextCursor =
      hasMore && last
        ? { cursorId: last.id, cursorCreatedAt: last.createdAt }
        : null;
    return Response.json(
      { notifications, nextCursor, hasMore },
      { status: 200 },
    );
  } catch (e) {
    return zodApiError(e);
  }
});
