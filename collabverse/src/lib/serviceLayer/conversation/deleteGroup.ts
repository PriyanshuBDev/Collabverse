import { pathProp } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
type mediaProp = {
  media: {
    path: string;
  }[];
};
export async function deleteGroup(
  workspaceId: string,
  conversationId: string,
  userId: string,
  name?: string,
  membersIds?: string[],
) {
  const supabase = supabaseAdmin();
  const allMedia = await prisma.message.findMany({
    where: {
      conversationId,
      workspaceId,
    },
    select: {
      media: {
        select: {
          path: true,
        },
      },
    },
  });

  const allPaths = allMedia.flatMap((message: mediaProp) =>
    message.media.map((media: pathProp) => media.path),
  );
  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });
  const { error } = await supabase.storage.from("Chat_Media").remove(allPaths);
  if (error) {
    console.error(error);
  }
  if (membersIds && membersIds.length > 0) {
    try {
      await prisma.notification.createMany({
        data: membersIds.map((m: string) => ({
          userId: m,
          senderId: userId,
          type: "kicked_group",
          workspaceId,
          target: {
            name,
          },
        })),
      });
    } catch (e) {
      console.error(e, "Failed to log notifications");
    }
  }
}
