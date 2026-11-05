import { WorkspacesProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { generateSlug } from "@/lib/functions/workspace/generateSlug";
import { Prisma } from "@prisma/client";

const MAX_RETRIES = 5;
export async function createWorkspaceService(
  userId: string,
  name: string,
  description?: string,
) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const slug = generateSlug(name);
    try {
      const res = await prisma.workspace.create({
        data: {
          name,
          slug,
          description,
          createdById: userId,
          currentOwnerId: userId,
          members: {
            create: {
              userId,
              role: "Owner",
            },
          },
          roles: {
            create: [
              {
                role: "Admin",
                permissions: [
                  "Approve_Join",
                  "Create_Project",
                  "Edit_Ws_Details",
                  "Invite",
                  "Remove_Member",
                ],
              },
              { role: "Member", permissions: [] },
            ],
          },
          activities: {
            create: {
              type: "workspace_created",
              actorUserId: userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          slug: true,
          createdAt: true,
          description: true,
          currentOwner: {
            select: {
              id: true,
              avatar: true,
              name: true,
            },
          },
        },
      });
      return {
        id: res.id,
        name: res.name,
        description: res.description,
        slug: res.slug,
        owner: res.currentOwner,
        createdAt: res.createdAt,
        avatar: undefined,
        members: 1,
        projects: 0,
      } as WorkspacesProps;
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }
  throw new Error("Failed to generate unique workspace slug");
}
