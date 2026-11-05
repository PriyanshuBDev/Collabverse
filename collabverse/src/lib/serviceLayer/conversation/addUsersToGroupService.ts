import { apiError } from "@/lib/functions/error/apiError";
import { createGroupUserProps, userIdProp } from "@/app/interfaces";
import { $Enums, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
type existingMemberProps = {
  status: $Enums.ConvMemberStatus | null;
  userId: string;
  kickedAt: Date | null;
  deletedAt: Date | null;
};
export async function addUsersToGroupService({
  tx,
  users,
  workspaceId,
  conversationId,
  strict,
}: {
  users: createGroupUserProps[];
  workspaceId: string;
  conversationId: string;
  strict: boolean;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx ?? prisma;
  const uniqueUsers = Array.from(
    new Map(users.map((u: createGroupUserProps) => [u.id, u])).values(),
  );
  const userIds = uniqueUsers.map((u: createGroupUserProps) => u.id);
  const multiple = userIds.length > 1;
  const workspaceMemberIds = await db.workspaceMember.findMany({
    where: {
      userId: { in: userIds },
      workspaceId,
    },
    select: {
      userId: true,
    },
  });
  let validUserIdsToCreate = workspaceMemberIds.map(
    (m: userIdProp) => m.userId,
  );
  let validUserIdsToUpdate: string[] = [];
  const invalidUserIds = userIds.filter(
    (id: string) => !validUserIdsToCreate.includes(id),
  );
  if (strict) {
    if (invalidUserIds.length === userIds.length) {
      return apiError("You can only add current workspace users", 400);
    }
    const existingMembers = await db.conversationMember.findMany({
      where: {
        userId: { in: validUserIdsToCreate },
        conversationId,
      },
      select: {
        userId: true,
        status: true,
        kickedAt: true,
        deletedAt: true,
      },
    });
    const existingIds = new Set(
      existingMembers.map((m: existingMemberProps) => m.userId),
    );

    validUserIdsToUpdate = existingMembers
      .filter(
        (i: existingMemberProps) =>
          (i.kickedAt || i.deletedAt) &&
          (i.status === "Kicked" || i.status === "Left"),
      )
      .map((i: existingMemberProps) => i.userId);
    const updateIdsSet = new Set(validUserIdsToUpdate);
    validUserIdsToCreate = workspaceMemberIds
      .map((m: userIdProp) => m.userId)
      .filter((id: string) => !existingIds.has(id) && !updateIdsSet.has(id));
    if (
      existingMembers.length === validUserIdsToCreate.length &&
      validUserIdsToUpdate.length === 0
    ) {
      const response = multiple
        ? `Users are already members`
        : "User is already a member";
      return apiError(response, 400);
    }
  }
  const createIds = new Set(validUserIdsToCreate);
  const validUsersToCreate = uniqueUsers.filter((u: createGroupUserProps) =>
    createIds.has(u.id),
  );
  if (validUsersToCreate.length > 0) {
    await db.conversationMember.createMany({
      data: validUsersToCreate.map((u: createGroupUserProps) => ({
        userId: u.id,
        workspaceId,
        role: u.role,
        status: "Active",
        conversationId,
      })),
      skipDuplicates: true,
    });
  }
  const updateIds = new Set(validUserIdsToUpdate);

  const validUsersToUpdate = uniqueUsers.filter((u: createGroupUserProps) =>
    updateIds.has(u.id),
  );
  if (validUserIdsToUpdate.length > 0) {
    await Promise.all(
      validUsersToUpdate.map((u: createGroupUserProps) =>
        db.conversationMember.update({
          where: {
            userId_conversationId: {
              conversationId,
              userId: u.id,
            },
          },
          data: {
            role: u.role,
            status: "Active",
            kickedAt: null,
            deletedAt: null,
          },
        }),
      ),
    );
  }
}
