import { withAuth } from "@/lib/api/auth/withAuth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@supabase/supabase-js";
import { z, ZodError } from "zod";
import { usernameSchema } from "@/lib/functions/route/usernameSchema";

const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(6, "Name is required must be atleast 6 characters")
    .max(25, "Name must be at most 25 characters")
    .refine((name) => !/\s{2,}/.test(name), {
      message: "Name cannot contain consecutive spaces",
    })
    .regex(/^[\p{L}]+([ '.-][\p{L}]+)*$/u, {
      message:
        "Name must contain only letters and single spaces, apostrophes, dots, or hyphens (no leading, trailing, or repeated separators).",
    }),
  username: usernameSchema,
});

export const POST = withAuth(async (user: User, req: Request) => {
  const data = await req.json();

  try {
    const { name, username } = onboardingSchema.parse(data);
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name,
        username,
        profileCompleted: true,
        lastLoginAt: new Date(),
      },
      create: {
        id: user.id,
        email: user.email!,
        name,
        username,
        profileCompleted: true,
        appearance: {
          create: {},
        },
      },
    });
    return Response.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return Response.json(
        { errors: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return new Response("Username already exist", { status: 409 });
    }
    return new Response("Something went wrong", { status: 500 });
  }
});
