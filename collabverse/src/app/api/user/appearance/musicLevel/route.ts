import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const patchMusicLevel = z.object({
  level: z.number().max(5).min(0),
});
export const PATCH = withAuth(async (user: User, req: Request) => {
  const body = await req.json();
  try {
    const { level } = patchMusicLevel.parse(body);
    await prisma.userAppearance.update({
      where: {
        userId: user.id,
      },
      data: {
        musicLevel: level,
      },
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return zodApiError(e);
  }
});
