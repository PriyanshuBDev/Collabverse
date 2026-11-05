import { TLCDataProps } from "@/components/charts/TeamLoadChart";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { TaskStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";

type StatusLabelKey = "To Do" | "In Progress" | "Done" | "In Review";

const StatusLabel: Record<TaskStatus, StatusLabelKey> = {
  [TaskStatus.To_Do]: "To Do",
  [TaskStatus.In_Progress]: "In Progress",
  [TaskStatus.In_Review]: "In Review",
  [TaskStatus.Done]: "Done",
};

export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!workspaceId || !projectId) {
      return new Response("Required param not found", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const project = await prisma.project.findUnique({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: { some: { workspaceMemberUserId: user.id } },
          }),
          id: projectId,
        },
        select: {
          members: {
            select: {
              workspaceMemberUserId: true,
              workspaceMember: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!project) {
        return new Response("Project not found", { status: 404 });
      }
      const tasks = await prisma.taskMember.findMany({
        where: {
          task: {
            workspaceId,
            projectId,
          },
        },
        select: {
          projectMemberUserId: true,
          task: {
            select: {
              status: true,
            },
          },
        },
      });

      const map = new Map<string, TLCDataProps>();
      for (const member of project.members) {
        const id = member.workspaceMemberUserId;
        const name = member.workspaceMember.user.name ?? "";
        map.set(id, {
          id,
          name,
          "To Do": 0,
          "In Progress": 0,
          "In Review": 0,
          Done: 0,
        });
      }
      for (const item of tasks) {
        const id = item.projectMemberUserId;

        const status = item.task.status;
        const label = StatusLabel[status];
        const userStats = map.get(id);
        if (!userStats) {
          continue;
        }
        userStats![label] += 1;
      }
      const users: TLCDataProps[] = Array.from(map.values());
      return Response.json({ users }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
