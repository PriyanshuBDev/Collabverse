import { prisma } from "@/lib/db/prisma";
import { z, ZodError } from "zod";

export const signUpSchema = z.object({
  id: z.string().uuid({ message: "Invalid user id" }),
  email: z.string().email({ message: "Invalid email" }),
});

export async function POST(req: Request) {
  const data = await req.json();
  try {
    const { id, email } = signUpSchema.parse(data);
    await prisma.user.create({
      data: {
        id,
        email,
        profileCompleted: false,
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
    return new Response("Internal Server Error", { status: 500 });
  }
}
