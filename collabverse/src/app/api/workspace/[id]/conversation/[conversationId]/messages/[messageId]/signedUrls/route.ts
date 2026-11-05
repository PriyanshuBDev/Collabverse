import { withAuth } from "@/lib/api/auth/withAuth";
import { signedUrlProps } from "@/lib/axios/workspace/conversation/messages/getSignedUrlsForChatMedia";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";
import z from "zod";
type pathProp = {
  path: string;
};
type signedProp = {
  error: string | null;
  path: string | null;
  signedUrl: string;
};
const getSignedUrlsSchema = z.object({
  paths: z.array(z.string()).min(1).max(50),
});
export const POST = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: { params: { id: string; conversationId: string; messageId: string } },
  ) => {
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const messageId = params.messageId;
    if (!workspaceId || !conversationId || !messageId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    const supabase = supabaseAdmin();
    try {
      const { paths } = getSignedUrlsSchema.parse(body);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      const message = await prisma.message.findFirst({
        where: {
          conversationId,
          workspaceId,
          id: messageId,
        },
        select: {
          id: true,
        },
      });
      if (!message) {
        return apiErrorCustom("Message not found");
      }
      const validPaths = (
        await prisma.messageMedia.findMany({
          where: {
            path: {
              in: paths,
            },
            messageId,
          },
          select: {
            path: true,
          },
        })
      ).map((v: pathProp) => v.path);
      if (validPaths.length === 0) {
        return apiError("Invalid file paths", 409);
      }

      const { data, error } = await supabase.storage
        .from("Chat_Media")
        .createSignedUrls(validPaths, 3600);
      if (error || !data) {
        return apiError("Failed to generate signed url for attachment", 500);
      }
      const expiresAt = Date.now() + 55 * 60 * 1000;
      const media: signedUrlProps[] = data.map((d: signedProp) => ({
        url: d.signedUrl,
        expiresAt,
        path: d.path ?? "",
      }));
      return Response.json({ media });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
