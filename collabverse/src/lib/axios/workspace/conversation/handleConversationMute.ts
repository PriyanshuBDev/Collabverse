import { MuteEnum } from "@prisma/client";
import api from "../..";

export async function handleConversationMute({
  workspaceId,
  conversationId,
  enabled,
  muteType,
}: {
  workspaceId: string;
  conversationId: string;
  enabled: boolean;
  muteType?: MuteEnum;
}) {
  await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/mute`,
    {
      enabled,
      muteType,
    },
  );
}
