import { projectInviteAllowedRoles } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { generateSlug } from "@/lib/functions/workspace/generateSlug";
import { Prisma } from "@prisma/client";
import { inviteUserService } from "./inviteUsersService";

const MAX_RETRIES = 5;

export interface projectInvitedUserProps {
  id: string;
  role: projectInviteAllowedRoles;
}

export async function createProjectService(
  userId: string,
  workspaceId: string,
  name: string,
  description?: string,
  dueDate?: Date,
  users?: projectInvitedUserProps[],
) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const slug = generateSlug(name);
    try {
      const res = await prisma.project.create({
        data: {
          name,
          slug,
          description,
          dueDate,
          createdById: userId,
          currentOwnerId: userId,
          workspaceId,
          members: {
            create: {
              workspaceMemberUserId: userId,
              role: "Owner",
              workspaceMemberWsId: workspaceId,
            },
          },
          roles: {
            create: [
              {
                role: "Manager",
                permissions: [
                  "Remove_Member",
                  "Invite",
                  "Edit_Project_Details",
                ],
              },
              {
                role: "Contributor",
                permissions: ["Comment", "Invite"],
              },
              {
                role: "Viewer",
                permissions: ["Comment"],
              },
            ],
          },
          activities: {
            create: {
              workspaceId,
              type: "project_created",
              actorUserId: userId,
              target: {
                name,
              },
            },
          },
          flowSpace: {
            create: {},
          },
        },
        select: {
          id: true,
          slug: true,
        },
      });

      if (users && users.length > 0) {
        await inviteUserService({
          currentUserId: userId,
          users,
          workspaceId,
          projectId: res.id,
          name,
          strict: false,
        });
      }
      return { slug: res.slug, id: res.id };
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
  throw new Error("Failed to generate unique project slug");
}
