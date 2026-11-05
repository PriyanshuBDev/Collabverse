import { inviteUsersToProjectProps } from "@/app/interfaces";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function invited_to_workspace_notification(
  tx: Prisma.TransactionClient,
  userId: string,
  senderId: string,
  workspaceId: string,
  invitationId: string,
  role: wsRoleChange,
  expireAt?: Date,
) {
  return await tx.notification.create({
    data: {
      userId,
      senderId,
      type: "invited_to_workspace",
      meta: {
        invitationId,
        role,
        expireAt,
      },
      workspaceId,
    },
  });
}
export async function workspace_left_notification(
  userId: string,
  workspaceId: string,
  name: string,
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "workspace_left",
        target: { id: workspaceId, name },
      },
    });
  } catch (e) {
    console.error("Notification failed", e);
  }
}
export async function project_due_date_changed_notification(
  memberIds: string[],
  senderId: string,
  workspaceId: string,
  projectId: string,
  projectSlug: string,
  projectName: string,
  oldValue?: Date,
  newValue?: Date,
) {
  return await prisma.notification.createMany({
    data: memberIds
      .filter((m: string) => m !== senderId)
      .map((m: string) => ({
        senderId,
        userId: m,
        workspaceId,
        type: "project_due_date_changed",
        target: {
          id: projectId,
          name: projectName,
          oldValue,
          newValue,
        },
        meta: {
          projectSlug,
        },
      })),
  });
}
export async function project_deleted_notification(
  memberIds: string[],
  workspaceId: string,
  senderId: string,
  name: string,
) {
  return await prisma.notification.createMany({
    data: memberIds.map((m: string) => ({
      workspaceId,
      type: "project_deleted",
      userId: m,
      senderId,
      target: {
        name,
      },
    })),
  });
}
export async function projectTransfer_notification(
  memberIds: string[],
  workspaceId: string,
  currentOwnerId: string,
  senderId: string,
  newOwnerId: string,
  projectName: string,
  projectSlug: string,
  newOwnerName: string,
  currentOwnerName: string,
  transferredBy?: string,
) {
  const notifications: Prisma.NotificationCreateManyInput[] = [
    {
      workspaceId,
      userId: currentOwnerId,
      senderId,
      type: "project_owner_transferred_from_you",
      target: {
        id: newOwnerId,
        name: newOwnerName,
      },
      meta: {
        projectName,
        transferredBy,
        projectSlug,
      },
    },
    {
      workspaceId,
      userId: newOwnerId,
      senderId,
      type: "project_owner_transferred_to_you",
      target: {
        id: currentOwnerId,
        name: currentOwnerName,
      },
      meta: {
        projectName,
        transferredBy,
        projectSlug,
      },
    },
  ];
  memberIds
    .filter((m: string) => m !== senderId)
    .forEach((id: string) =>
      notifications.push({
        workspaceId,
        userId: id,
        senderId,
        type: "project_owner_transferred",
        target: {
          oldValue: currentOwnerName,
          newValue: newOwnerName,
        },
        meta: {
          projectName,
          transferredBy,
          projectSlug,
        },
      }),
    );
  await prisma.notification.createMany({
    data: notifications,
  });
}
export async function task_completed_notification(
  memberIds: string[],
  senderId: string,
  workspaceId: string,
  taskId: string,
  taskName: string,
) {
  return await prisma.notification.createMany({
    data: memberIds
      .filter((m: string) => m !== senderId)
      .map((m: string) => ({
        userId: m,
        senderId,
        type: "task_completed",
        workspaceId,
        target: {
          id: taskId,
          name: taskName,
        },
      })),
  });
}
export async function taskPatch_notification(
  memberIds: string[],
  workspaceId: string,
  senderId: string,
  taskId: string,
  taskName: string,
  taskSlug: string,
  projectName: string,
  projectSlug: string,
  statusCheck: boolean,
  dueDateCheck: boolean,
  newValue?: Date,
  oldValue?: Date,
) {
  const notifications: Prisma.NotificationCreateManyInput[] = [];
  if (statusCheck && status === "Done") {
    memberIds.map((m: string) =>
      notifications.push({
        userId: m,
        senderId,
        workspaceId,
        type: "task_completed",
        target: {
          id: taskId,
          name: taskName,
        },
        meta: {
          taskSlug,
          projectSlug,
          projectName,
        },
      }),
    );
  }
  if (dueDateCheck) {
    memberIds.map((m: string) =>
      notifications.push({
        userId: m,
        senderId,
        workspaceId,
        type: "task_due_date_changed",
        target: {
          id: taskId,
          name: taskName,
          newValue,
          oldValue,
        },
        meta: {
          taskSlug,
          projectSlug,
          projectName,
        },
      }),
    );
  }
  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }
}
export async function task_unassigned_notifiation(
  userId: string,
  senderId: string,
  workspaceId: string,
  taskId: string,
  taskName: string,
  projectId: string,
  projectName: string,
  projectSlug: string,
) {
  if (userId === senderId) return;
  try {
    await prisma.notification.create({
      data: {
        userId,
        senderId,
        type: "task_unassigned",
        workspaceId,
        target: {
          id: taskId,
          name: taskName,
        },
        meta: {
          projectId,
          projectName,
          projectSlug,
        },
      },
    });
  } catch (e) {
    console.log("Notification logging failed", e);
  }
}
export async function task_role_changed_notification(
  workspaceId: string,
  userId: string,
  senderId: string,
  taskId: string,
  taskName: string,
  taskSlug: string,
  oldValue: string,
  newValue: string,
  projectId: string,
  projectName: string,
  projectSlug: string,
) {
  if (userId === senderId) return;
  try {
    await prisma.notification.create({
      data: {
        workspaceId,
        userId,
        senderId,
        type: "task_role_changed",
        target: {
          id: taskId,
          name: taskName,
          oldValue,
          newValue,
        },
        meta: {
          taskSlug,
          projectId,
          projectName,
          projectSlug,
        },
      },
    });
  } catch (e) {
    console.log("Notification logging failed", e);
  }
}
type filteredUsersProps = {
  id: string;
  role: "Assignee" | "Reviewer";
};
export async function task_assigned_notifiation(
  filteredUsers: filteredUsersProps[],
  senderId: string,
  workspaceId: string,
  taskId: string,
  taskName: string,
  taskSlug: string,
  projectName: string,
  projectSlug: string,
) {
  try {
    await prisma.notification.createMany({
      data: filteredUsers
        .filter((f: filteredUsersProps) => f.id !== senderId)
        .map((f: filteredUsersProps) => ({
          senderId,
          userId: f.id,
          workspaceId,
          type: "task_assigned",
          target: {
            id: taskId,
            name: taskName,
          },
          meta: {
            role: f.role,
            projectName,
            projectSlug,
            taskSlug,
          },
        })),
    });
  } catch (e) {
    console.error("Failed to log notification", e);
  }
}
export async function removed_from_project_notification(
  userId: string,
  workspaceId: string,
  senderId: string,
  projectId: string,
  projectName: string,
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        workspaceId,
        senderId,
        type: "removed_from_project",
        target: {
          id: projectId,
          name: projectName,
        },
      },
    });
  } catch (e) {
    console.error("Notification logging failed", e);
  }
}
export async function project_role_change_notification(
  userId: string,
  workspaceId: string,
  senderId: string,
  projectId: string,
  projectName: string,
  oldValue: string,
  newValue: string,
  projectSlug: string,
) {
  if (userId === senderId) return;
  try {
    await prisma.notification.create({
      data: {
        userId,
        workspaceId,
        type: "project_role_change",
        senderId,
        target: {
          id: projectId,
          name: projectName,
          oldValue,
          newValue,
        },
        meta: {
          projectSlug,
        },
      },
    });
  } catch (e) {
    console.log("Notification logging failed", e);
  }
}
export async function workspaceTransfer_notification(
  memberIds: string[],
  workspaceId: string,
  userId: string,
  userName: string,
  newOwnerId: string,
  newOwnerName: string,
) {
  const notifications: Prisma.NotificationCreateManyInput[] = [
    {
      workspaceId,
      userId,
      senderId: userId,
      type: "workspace_owner_transferred_from_you",
      target: {
        id: newOwnerId,
        name: newOwnerName,
      },
    },
    {
      workspaceId,
      userId: newOwnerId,
      senderId: userId,
      type: "workspace_owner_transferred_to_you",
      target: {
        id: userId,
        name: userName,
      },
    },
  ];
  memberIds
    .filter((m: string) => m !== userId)
    .forEach((id: string) =>
      notifications.push({
        workspaceId,
        userId: id,
        senderId: userId,
        type: "workspace_owner_transferred",
        target: {
          oldValue: userName,
          newValue: newOwnerName,
        },
      }),
    );
  await prisma.notification.createMany({
    data: notifications,
  });
}
export async function removed_from_workspace_notification(
  userId: string,
  senderId: string,
  workspaceId: string,
  workspaceName: string,
  workspaceAvatar?: string,
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        senderId,
        type: "removed_from_workspace",
        target: {
          id: workspaceId,
          name: workspaceName,
        },
        meta: {
          avatar: workspaceAvatar,
        },
      },
    });
  } catch (e) {
    console.error("Notification logging failed", e);
  }
}
export async function workspace_role_changed_notification(
  userId: string,
  senderId: string,
  workspaceId: string,
  newValue: string,
  oldValue: string,
) {
  if (userId === senderId) return;
  try {
    await prisma.notification.create({
      data: {
        userId,
        senderId,
        workspaceId,
        type: "workspace_role_changed",
        target: {
          oldValue,
          newValue,
        },
      },
    });
  } catch (e) {
    console.error("Notification failed", e);
  }
}

export async function workspace_join_notification(
  userId: string,
  senderId: string,
  workspaceId: string,
  status: "Approved" | "Rejected",
  workspaceName?: string,
) {
  await prisma.notification.create({
    data: {
      userId,
      senderId,
      ...(status === "Approved" && { workspaceId }),
      type:
        status === "Approved"
          ? "workspace_join_accepted"
          : "workspace_join_declined",
      ...(status === "Rejected" && {
        target: {
          name: workspaceName,
        },
      }),
    },
  });
}

export async function invited_to_project_notification(
  tx: Prisma.TransactionClient,
  users: inviteUsersToProjectProps[],
  workspaceId: string,
  senderId: string,
  projectId: string,
  projectName: string,
  expireAt?: Date,
) {
  try {
    await tx.notification.createMany({
      data: users.map((u: inviteUsersToProjectProps) => ({
        workspaceId,
        userId: u.userId,
        senderId,
        type: "invited_to_project",
        target: {
          id: projectId,
          name: projectName,
        },
        meta: {
          role: u.role,
          expireAt,
          invitationId: u.id,
        },
      })),
    });
  } catch (e) {
    console.log("Notification logging failed", e);
  }
}
