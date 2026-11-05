import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { GroupRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { addUsersToGroupService } from "@/lib/serviceLayer/conversation/addUsersToGroupService";
import { prismaTransactionProp } from "@/app/interfaces";
import { nameSchema } from "@/lib/functions/route/nameSchema";
type userIdRole = {
  id: string;
  role: "Admin" | "Member";
};
const createConversationSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
  users: z
    .array(
      z.object({
        id: z.string().uuid({ message: "Invalid id" }),
        role: z.enum(GroupRole),
      }),
    )
    .optional(),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { name, description, users } = createConversationSchema.parse(body);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          const createdConvo = await tx.conversation.create({
            data: {
              name,
              description,
              workspaceId,
              type: "Group",
              createdById: user.id,
              groupPermissions: {
                create: {
                  permissions: ["Pin", "Send_Messages", "Send_Files"],
                },
              },
            },
            select: {
              id: true,
            },
          });
          await addUsersToGroupService({
            tx,
            users: [
              ...(users ?? []).filter((u: userIdRole) => u.id !== user.id),
              { id: user.id, role: "Admin" },
            ],
            workspaceId,
            conversationId: createdConvo.id,
            strict: false,
          });
          return createdConvo;
        },
      );
      return Response.json({ id: res.id }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
