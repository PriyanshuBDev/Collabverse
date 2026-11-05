import { prisma } from "@/lib/db/prisma";
import { projectInvitedUserProps } from "./createProjectService";
import { apiError } from "@/lib/functions/error/apiError";
import { invited_to_project_notification } from "@/lib/functions/notifications/notifications";
import {
  inviteUsersToProjectProps,
  prismaTransactionProp,
  userIdProp,
  wsMemberUserIdProp,
} from "@/app/interfaces";
type invitedUserProp = {
  invitedUserId: string | null;
};
export async function inviteUserService({
  currentUserId,
  users,
  workspaceId,
  projectId,
  name,
  expireAt,
  strict,
}: {
  currentUserId: string;
  users: projectInvitedUserProps[];
  workspaceId: string;
  projectId: string;
  name: string;
  expireAt?: Date;
  strict: boolean;
}) {
  const uniqueUsers = Array.from(
    new Map(users.map((u: projectInvitedUserProps) => [u.id, u])).values(),
  );
  const userIds = uniqueUsers.map((u: projectInvitedUserProps) => u.id);
  const multiple = userIds.length > 1;
  const workspaceMemberIds = await prisma.workspaceMember.findMany({
    where: {
      userId: { in: userIds },
      workspaceId,
    },
    select: {
      userId: true,
    },
  });
  let validInviteesIds = workspaceMemberIds
    .map((m: userIdProp) => m.userId)
    .filter((u: string) => u !== currentUserId);
  const invalidInviteesIds = userIds.filter(
    (id: string) => !validInviteesIds.includes(id),
  );
  if (strict) {
    if (invalidInviteesIds.length === userIds.length) {
      return apiError("You can only invite current workspace users", 400);
    }
    const alreadyProjectMembers = await prisma.projectMember.findMany({
      where: {
        workspaceMemberUserId: { in: validInviteesIds },
        workspaceMemberWsId: workspaceId,
        projectId,
      },
      select: {
        workspaceMemberUserId: true,
      },
    });
    const alreadyProjectMembersIds = alreadyProjectMembers.map(
      (m: wsMemberUserIdProp) => m.workspaceMemberUserId,
    );
    if (alreadyProjectMembersIds.length === validInviteesIds.length) {
      const response = multiple
        ? `Users already are members`
        : "User is already a member";
      return apiError(response, 400);
    }
    const notAlreadyMembersIds = validInviteesIds.filter(
      (i: string) => !alreadyProjectMembersIds.includes(i),
    );
    const alreadyInvitedUsers = await prisma.invitation.findMany({
      where: {
        invitedUserId: { in: notAlreadyMembersIds },
        workspaceId,
        projectId,
        status: "Pending",
        OR: [{ expireAt: null }, { expireAt: { gt: new Date() } }],
      },
      select: {
        invitedUserId: true,
      },
    });
    const alreadyInvitedUsersIds = alreadyInvitedUsers.map(
      (m: invitedUserProp) => m.invitedUserId,
    );
    if (alreadyInvitedUsersIds.length === notAlreadyMembersIds.length) {
      const response = multiple
        ? "Users are already invited"
        : "User is already invited";
      return apiError(response, 400);
    }
    const notAlreadyInvitedUsersIds = notAlreadyMembersIds.filter(
      (m: string) => !alreadyInvitedUsersIds.includes(m),
    );
    validInviteesIds = notAlreadyInvitedUsersIds;
  }

  const validInvitees = uniqueUsers.filter((u: projectInvitedUserProps) =>
    validInviteesIds.includes(u.id),
  );
  const invitationData: inviteUsersToProjectProps[] = validInvitees.map(
    (u: projectInvitedUserProps) => ({
      id: crypto.randomUUID(),
      userId: u.id,
      role: u.role,
    }),
  );
  await prisma.$transaction(async (tx: prismaTransactionProp) => {
    await tx.invitation.createMany({
      data: invitationData.map((i: inviteUsersToProjectProps) => ({
        id: i.id,
        projectId,
        workspaceId,
        invitedUserId: i.userId,
        createdById: currentUserId,
        requireApproval: false,
        expireAt,
        role: i.role,
      })),
      skipDuplicates: true,
    });
    await invited_to_project_notification(
      tx,
      invitationData,
      workspaceId,
      currentUserId,
      projectId,
      name,
      expireAt,
    );
  });
}
