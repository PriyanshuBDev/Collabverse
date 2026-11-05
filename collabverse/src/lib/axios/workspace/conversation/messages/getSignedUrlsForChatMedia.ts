import api from "@/lib/axios";
import { signedUrl } from "@/lib/hooks/zustand/useMediaStore";
export interface signedUrlProps extends signedUrl {
  path: string;
}
export async function getSignedUrlsForChatMedia({
  workspaceId,
  conversationId,
  messageId,
  paths,
}: {
  workspaceId: string;
  conversationId: string;
  messageId: string;
  paths: string[];
}) {
  const res = await api.post<{ media: signedUrlProps[] }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/${messageId}/signedUrls`,
    {
      paths,
    },
  );
  return res.data.media;
}
