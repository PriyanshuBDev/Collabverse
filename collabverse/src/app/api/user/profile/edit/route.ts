import { withAuth } from "@/lib/api/auth/withAuth";
import { editProfileSchema } from "@/lib/axios/user/editProfile";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import { ZodError } from "zod";

export const POST = withAuth(async (user: User, req: Request) => {
  const data = await req.json();
  try {
    const { name, username, bio } = editProfileSchema.parse(data);
    const updateData: Prisma.UserUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;

    const res = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
      select: {
        name: true,
        username: true,
        bio: true,
      },
    });
    return Response.json(
      { name: res.name, username: res.username, bio: res.bio },
      { status: 200 },
    );
  } catch (e) {
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
