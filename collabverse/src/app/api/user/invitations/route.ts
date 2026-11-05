import { userInvitationsProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type inviteProp = {
  status: $Enums.InvitationStatus;
  id: string;
  expireAt: Date | null;
  role: $Enums.InvitationRole;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  workspace: {
    id: string;
    name: string;
    avatar: string | null;
  };
};
export const GET = withAuth(async (user: User) => {
  try {
    const invites = await prisma.invitation.findMany({
      where: {
        invitedUserId: user.id,
        status: "Pending",
        OR: [
          {
            expireAt: {
              gte: new Date(),
            },
          },
          {
            expireAt: null,
          },
        ],
      },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        role: true,
        expireAt: true,
        id: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        status: true,
        createdAt: true,
        maxUses: true,
        usedCount: true,
      },
    });
    const invitations: userInvitationsProps[] = invites.map(
      (i: inviteProp) => ({
        id: i.id,
        role: i.role,
        expireAt: i.expireAt ?? undefined,
        workspace: i.workspace
          ? {
              id: i.workspace.id,
              name: i.workspace.name,
              avatar: i.workspace.avatar ?? undefined,
            }
          : undefined,
        project: i.project
          ? {
              id: i.project.id,
              name: i.project.name,
              avatar: i.project.avatar ?? undefined,
            }
          : undefined,
        invitedBy: i.createdBy
          ? {
              id: i.createdBy.id,
              name: i.createdBy.name ?? "unknown",
              avatar: i.createdBy.avatar ?? undefined,
            }
          : {
              id: undefined,
              name: "Former member",
              avatar: "/assets/anonymous.webp",
            },
        createdAt: i.createdAt,
        available: i.maxUses ? i.maxUses - i.usedCount : null,
      }),
    );
    return Response.json({ invitations }, { status: 200 });
  } catch {
    return apiErrorCustom("Something went wrong");
  }
});
