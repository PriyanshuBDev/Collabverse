import { memberProps, prismaUserProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { isWorkspaceMember } from "@/lib/serviceLayer/workspace/isWorkspaceMember";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    if (!workspaceId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    if (!search) return Response.json({ users: [] }, { status: 200 });
    try {
      const currentUser = await isWorkspaceMember(user.id, workspaceId);
      if (!currentUser) {
        return new Response("You are not authorised", { status: 403 });
      }
      const take = 5;
      const res = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: { not: user.id },
          user: search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              }
            : undefined,
        },
        orderBy: {
          user: {
            name: "asc",
          },
        },
        take,
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      const users: memberProps[] = res.map((u: prismaUserProp) => ({
        id: u.user.id,
        name: u.user.name ?? "",
        avatar: u.user.avatar ?? undefined,
        username: u.user.username ?? "",
      }));
      return Response.json({ users }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
