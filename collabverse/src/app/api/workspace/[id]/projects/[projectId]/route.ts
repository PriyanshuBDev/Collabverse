import {
  CompleteProjectProps,
  memberProps,
  workspaceMemberProp,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }
      const userProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (
        userWsRole !== "Owner" &&
        userWsRole !== "Admin" &&
        !userProjectRole
      ) {
        return apiError("You are not authorised", 403);
      }
      const res = await prisma.project.findFirst({
        where: {
          id: projectId,
          workspaceId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          avatarPath: true,
          tasks: {
            where: { status: "Done" },
            select: { id: true },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
          createdById: true,
          createdAt: true,
          currentOwner: {
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
          },
          dueDate: true,
          description: true,
          members: {
            take: 5,
            select: {
              workspaceMember: {
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
              },
            },
          },
        },
      });
      if (!res) {
        return apiError("Project not found", 404);
      }
      const defaultUser = {
        id: "",
        name: "Former Member",
        avatar: "/assets/anonymous.webp",
        username: "",
      };
      let createdBy: memberProps = defaultUser;
      if (res.createdById) {
        const creatorMembership = await prisma.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: res.createdById,
              workspaceId,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                username: true,
              },
            },
          },
        });
        if (!creatorMembership) {
          createdBy = defaultUser;
        } else {
          createdBy = {
            id: creatorMembership.user.id,
            name: creatorMembership.user.name ?? "unknown",
            avatar: creatorMembership.user.avatar ?? undefined,
            username: creatorMembership.user.username ?? "",
          };
        }
      }

      const project: CompleteProjectProps = {
        id: res.id,
        name: res.name,
        slug: res.slug,
        createdAt: res.createdAt,
        avatar: res.avatar ?? undefined,
        avatarPath: res.avatarPath ?? undefined,
        description: res.description ?? undefined,
        dueDate: res.dueDate,
        owner: {
          id: res.currentOwner?.user.id,
          name: res.currentOwner?.user.name ?? "unknown",
          avatar: res.currentOwner?.user.avatar ?? undefined,
          username: res.currentOwner?.user.username ?? "",
        },
        totalTasks: res._count.tasks,
        completedTasks: res.tasks.length,
        members: res.members.map((m: workspaceMemberProp) => ({
          id: m.workspaceMember.user.id,
          name: m.workspaceMember.user.name ?? "unknown",
          username: m.workspaceMember.user.username ?? "unknown",
          avatar: m.workspaceMember.user.avatar ?? undefined,
        })),
        totalMembers: res._count.members,
        createdBy,
      };
      return Response.json({ project }, { status: 200 });
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
