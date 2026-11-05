import { notificationProps } from "@/app/interfaces";
import api from "../..";

export async function getSingleNotification(notificationId: string) {
  const res = await api.get<{ notification: notificationProps }>(
    `/api/user/notifications/${notificationId}`,
  );
  return res.data.notification;
}
