import { prisma } from "@/lib/db/prisma";
import { MuteEnum } from "@prisma/client";

export async function fixMute(
  conversationId: string,
  userId: string,
  mutedFor: MuteEnum | null,
  mutedAt: Date | null,
) {
  if (!mutedFor || !mutedAt) return;
  if (mutedFor === "Always") return;
  const expiresAt = new Date(mutedAt);

  if (mutedFor === "Eight") {
    expiresAt.setHours(expiresAt.getHours() + 8);
  } else if (mutedFor === "Week") {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  if (Date.now() >= expiresAt.getTime()) {
    try {
      await prisma.conversationMember.update({
        where: {
          userId_conversationId: {
            userId,
            conversationId,
          },
        },
        data: {
          mutedAt: null,
          mutedFor: null,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
