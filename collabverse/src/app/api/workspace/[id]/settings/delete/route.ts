import { pathProp, userIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";
type attachProp = {
  attachments: {
    path: string;
  }[];
};
type proProp = {
  avatarPath: string | null;
  tasks: attachProp[];
};
type mediaProp = {
  media: {
    path: string;
  }[];
};
type convoProp = {
  avatarPath: string | null;
  messages: mediaProp[];
};
export const DELETE = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }

    try {
      const supabase = supabaseAdmin();
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole || currentUserWsRole !== "Owner") {
        return apiErrorCustom("You are not authorised");
      }

      const res = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          name: true,
          avatarPath: true,
          members: {
            where: {
              NOT: {
                userId: user.id,
              },
            },
            select: {
              userId: true,
            },
          },
          projects: {
            select: {
              avatarPath: true,
              tasks: {
                select: {
                  attachments: {
                    select: {
                      path: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Workspace not found");
      }
      const conversations = await prisma.conversation.findMany({
        where: {
          workspaceId,
        },
        select: {
          avatarPath: true,
          messages: {
            select: {
              media: {
                select: {
                  path: true,
                },
              },
            },
          },
        },
      });
      const avatarPaths: string[] = [];
      const attachmentPaths: string[] = [];
      const mediaPaths: string[] = [];
      if (res.avatarPath) {
        avatarPaths.push(res.avatarPath);
      }
      res.projects.forEach((p: proProp) => {
        if (p.avatarPath) {
          avatarPaths.push(p.avatarPath);
        }
        p.tasks.forEach((t: attachProp) => {
          t.attachments.forEach((a: pathProp) => {
            attachmentPaths.push(a.path);
          });
        });
      });
      conversations.forEach((c: convoProp) => {
        if (c.avatarPath) {
          avatarPaths.push(c.avatarPath);
        }
        c.messages.forEach((msg: mediaProp) => {
          msg.media.forEach((m: pathProp) => {
            mediaPaths.push(m.path);
          });
        });
      });
      if (avatarPaths.length > 0) {
        const { error } = await supabase.storage
          .from("Avatars")
          .remove(avatarPaths);
        console.error(error);
      }
      if (attachmentPaths.length > 0) {
        const chunkSize = 1000;

        for (let i = 0; i < attachmentPaths.length; i += chunkSize) {
          const chunk = attachmentPaths.slice(i, i + chunkSize);
          const { error } = await supabase.storage
            .from("Attachments")
            .remove(chunk);
          console.error(error);
        }
      }
      if (mediaPaths.length > 0) {
        const chunkSize = 1000;

        for (let i = 0; i < mediaPaths.length; i += chunkSize) {
          const chunk = mediaPaths.slice(i, i + chunkSize);
          const { error } = await supabase.storage
            .from("Chat_Media")
            .remove(chunk);
          console.error(error);
        }
      }
      await prisma.workspace.delete({
        where: { id: workspaceId },
      });
      try {
        await prisma.notification.createMany({
          data: res.members.map((m: userIdProp) => ({
            senderId: user.id,
            userId: m.userId,
            type: "workspace_deleted",
            target: {
              name: res.name,
            },
          })),
        });
      } catch (e) {
        console.error("Failed to log notification", e);
      }

      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
