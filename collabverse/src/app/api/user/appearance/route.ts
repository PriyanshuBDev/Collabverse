import { fullUserAppearance } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User) => {
  try {
    const res = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        appearance: {
          select: {
            bodyId: true,
            outfit: true,
            hairstyle: true,
            eyes: true,
            accessory: true,
            dnd: true,
            musicLevel: true,
          },
        },
      },
    });
    if (!res || !res.appearance) {
      return apiErrorCustom("User not found");
    }
    const userAppearance: fullUserAppearance = {
      playerId: res.id,
      name: res.name ?? "Unknown",
      username: res.username ?? "unknown",
      avatar: res.avatar ?? undefined,
      appearance: {
        body: res.appearance.bodyId,
        outfit: res.appearance.outfit,
        hairstyle: res.appearance.hairstyle,
        eyes: res.appearance.eyes,
        accessory: res.appearance.accessory,
      },
      dnd: res.appearance.dnd,
      musicLevel: res.appearance.musicLevel,
    };
    return Response.json({ userAppearance });
  } catch (e) {
    console.error(e);
    return apiErrorCustom("Something went wrong");
  }
});
