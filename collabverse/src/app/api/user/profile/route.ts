import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(async (user: User) => {
  try {
    const res = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        avatar: true,
        avatarPath: true,
        name: true,
        username: true,
        mute: true,
        bio: true,
        email: true,
        twoFA: true,
        createdAt: true,
        _count: {
          select: {
            ownedWorkspaces: true,
          },
        },
        appearance: {
          select: {
            bodyId: true,
            accessory: true,
            outfit: true,
            eyes: true,
            hairstyle: true,
          },
        },
      },
    });
    if (!res || !res.appearance) {
      return new Response("User not found", { status: 404 });
    }
    const appearance = {
      body: res.appearance.bodyId,
      outfit: res.appearance.outfit,
      hairstyle: res.appearance.hairstyle,
      eyes: res.appearance.eyes,
      accessory: res.appearance.accessory,
    };
    return Response.json(
      { ...res, appearance, wsCount: res._count.ownedWorkspaces },
      { status: 200 },
    );
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
});
