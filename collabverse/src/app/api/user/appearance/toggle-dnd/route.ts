import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(async (user: User) => {
  try {
    const res = await prisma.userAppearance.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        dnd: true,
      },
    });
    if (!res) return apiErrorCustom("User not found");
    await prisma.userAppearance.update({
      where: {
        userId: user.id,
      },
      data: {
        dnd: !res.dnd,
      },
    });
    return Response.json({ dnd: !res.dnd });
  } catch (e) {
    console.log(e);
    return apiErrorCustom("Something went wrong");
  }
});
