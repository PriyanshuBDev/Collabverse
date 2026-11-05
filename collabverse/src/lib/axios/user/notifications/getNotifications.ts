import { notificationResProps } from "@/app/interfaces";
import api from "../..";

export async function getNotifications({
  workspaceId,
  cursorCreatedAt,
  cursorId,
}: {
  workspaceId?: string;
  cursorCreatedAt?: Date;
  cursorId?: string;
}) {
  const res = await api.get<notificationResProps>(`/api/user/notifications`, {
    params: {
      workspaceId,
      cursorCreatedAt,
      cursorId,
    },
  });
  return res.data;
}
