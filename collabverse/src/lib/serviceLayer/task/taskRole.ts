import { prisma } from "@/lib/db/prisma";

export async function taskRole(userId: string, taskId: string) {
  const res = await prisma.taskMember.findUnique({
    where: {
      projectMemberUserId_taskId: {
        projectMemberUserId: userId,
        taskId,
      },
    },
    select: {
      role: true,
    },
  });
  return res?.role;
}
