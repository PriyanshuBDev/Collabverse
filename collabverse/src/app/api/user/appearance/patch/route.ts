import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";

const patchUserAppearanceSchema = z.object({
  body: z.string().regex(/^body-(?:0[1-9])$/),
  hairstyle: z.string().regex(/^hairstyle-(?:0[1-9]|[1-9]\d|1\d\d|200)$/),
  outfit: z.string().regex(/^outfit-(?:0[1-9]|[1-9]\d|1[0-2]\d|132)$/),
  eyes: z.string().regex(/^eyes-(?:0[1-7])$/),

  accessory: z
    .string()
    .regex(/^accessory-(?:0[1-9]|[1-7]\d|8[0-5])$/)

    .nullable(),
});

export const PATCH = withAuth(async (user: User, req: Request) => {
  const data = await req.json();

  try {
    const { body, hairstyle, outfit, eyes, accessory } =
      patchUserAppearanceSchema.parse(data);
    await prisma.userAppearance.update({
      where: {
        userId: user.id,
      },
      data: {
        bodyId: body,
        hairstyle,
        outfit,
        eyes,
        accessory,
      },
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return zodApiError(e);
  }
});
