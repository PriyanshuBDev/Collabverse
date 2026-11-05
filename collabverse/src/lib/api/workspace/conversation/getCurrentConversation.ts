import { currentConversationProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseServerFrontend } from "@/lib/supabase/serverFrontend";
import { notFound, redirect } from "next/navigation";

export const getCurrentConversation = async (
  currentConversationId: string,
  slug: string,
): Promise<currentConversationProps> => {
  const supabase = await supabaseServerFrontend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/signin");
  }
  if (!currentConversationId) {
    return notFound();
  }
  const ws = await prisma.workspace.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  if (!ws) {
    return notFound();
  }
  const role = await wsRole(user.id, ws.id);
  if (!role) {
    return notFound();
  }
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: currentConversationId,
      workspaceId: ws.id,
    },
    select: {
      id: true,
      type: true,
    },
  });
  if (!conversation) return notFound();
  return {
    id: conversation.id,
    type: conversation.type,
  };
};
