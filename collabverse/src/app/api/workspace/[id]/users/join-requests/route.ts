import { approvalReqProps, userIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  id: string;
  role: $Enums.InvitationRole;
  createdAt: Date;
  invitation: {
    createdBy: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    } | null;
  };
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    username: string | null;
  };
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");

    const PAGE_SIZE = 10;

    if (!workspaceId) {
      return new Response("Required params not found", { status: 400 });
    }
    const pageNumber = Number(page);
    if (!pageNumber || pageNumber < 1) {
      return new Response("Required page number not found", {
        status: 400,
      });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }

      if (role === "Admin") {
        const workspacePerm = await prisma.workspaceRole.findUnique({
          where: {
            workspaceId_role: {
              role: "Admin",
              workspaceId,
            },
          },
          select: {
            permissions: true,
          },
        });
        if (
          !workspacePerm ||
          !workspacePerm.permissions.includes("Approve_Join")
        ) {
          return new Response("You are not authorised", { status: 403 });
        }
      }
      const res = await prisma.joinRequest.findMany({
        where: {
          workspaceId,
          status: "Pending",
        },
        take: PAGE_SIZE,
        skip: (pageNumber - 1) * PAGE_SIZE,
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          role: true,
          invitation: {
            select: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          createdAt: true,
        },
      });
      const total = await prisma.joinRequest.count({
        where: {
          workspaceId,
          status: "Pending",
        },
      });
      const createdByIds = [
        ...new Set(
          res.flatMap((r: resProp) =>
            r.invitation.createdBy ? [r.invitation.createdBy?.id] : [],
          ),
        ),
      ];
      const members = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: {
            in: createdByIds,
          },
        },
        select: {
          userId: true,
        },
      });
      const memberSet = new Set(members.map((m: userIdProp) => m.userId));
      const requests: approvalReqProps[] = res.map((r: resProp) => {
        return {
          id: r.id,
          user: {
            id: r.user.id,
            avatar: r.user.avatar ?? undefined,
            username: r.user.username ?? "unknown",
            name: r.user.name ?? "unknown",
            role: r.role,
          },
          invitedBy:
            r.invitation.createdBy && memberSet.has(r.invitation.createdBy.id)
              ? {
                  ...r.invitation.createdBy,
                }
              : {
                  id: null,
                  name: "Former member",
                  avatar: "/assets/anonymous.webp",
                },
          createdAt: r.createdAt,
        };
      });

      return Response.json({
        requests,
        total,
        page: pageNumber,
        limit: PAGE_SIZE,
      });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
