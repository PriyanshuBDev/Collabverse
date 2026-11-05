import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { workspace_join_notification } from "@/lib/functions/notifications/notifications";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

export const joinRequestSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; reqId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const joinReqId = params.reqId;
    const body = await req.json();
    if (!workspaceId) {
      return new Response("Required params not found", { status: 400 });
    }
    try {
      const { status } = joinRequestSchema.parse(body);
      const role = await wsRole(user.id, workspaceId);
      if (!role || role === "Member") {
        return new Response("You are not authorised", { status: 403 });
      }
      if (role === "Admin") {
        const wsPerm = await prisma.workspaceRole.findUnique({
          where: {
            workspaceId_role: {
              workspaceId,
              role,
            },
          },
          select: {
            permissions: true,
          },
        });
        if (!wsPerm || !wsPerm.permissions.includes("Approve_Join")) {
          return new Response("You are not authorised", { status: 403 });
        }
      }
      const exists = await prisma.joinRequest.findUnique({
        where: {
          id: joinReqId,
        },
        select: {
          userId: true,
          role: true,
          status: true,
        },
      });
      if (!exists) {
        return new Response("Join request not found", { status: 404 });
      }
      if (exists.status !== "Pending") {
        return new Response("Request already processed", { status: 400 });
      }
      const alreadyMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: exists.userId,
            workspaceId,
          },
        },
        select: {
          userId: true,
        },
      });
      if (alreadyMember?.userId) {
        return new Response("Already approved", { status: 400 });
      }

      if (exists.role !== "Admin" && exists.role !== "Member") {
        return new Response("Invalid role", { status: 400 });
      }
      const requestedUserRole = exists.role;
      if (status === "Approved") {
        await prisma.$transaction(async (tx: prismaTransactionProp) => {
          const request = await tx.joinRequest.findUnique({
            where: { id: joinReqId },
            select: {
              status: true,
            },
          });

          if (!request || request.status !== "Pending") {
            return new Response("Request already processed", { status: 400 });
          }
          await tx.joinRequest.update({
            where: {
              id: joinReqId,
              status: "Pending",
            },
            data: {
              status: "Approved",
              reviewedById: user.id,
              reviewedAt: new Date(),
            },
          });
          await tx.workspaceMember.create({
            data: {
              userId: exists.userId,
              role: requestedUserRole,
              workspaceId,
            },
          });
        });
        try {
          await prisma.activity.create({
            data: {
              workspaceId,
              type: "workspace_member_added",
              actorUserId: user.id,
              affectedUserId: exists.userId,
              meta: {
                role: requestedUserRole,
              },
            },
          });
        } catch (e) {
          console.log("Activity logging failed", e);
        }
      } else {
        await prisma.joinRequest.update({
          where: {
            id: joinReqId,
          },
          data: {
            status: "Rejected",
            reviewedAt: new Date(),
            reviewedById: user.id,
          },
        });
      }
      try {
        const workspace = await prisma.workspace.findUnique({
          where: {
            id: workspaceId,
          },
          select: {
            name: true,
          },
        });

        await workspace_join_notification(
          exists.userId,
          user.id,
          workspaceId,
          status,
          workspace?.name,
        );
      } catch (e) {
        console.log("Notication creation failed", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
