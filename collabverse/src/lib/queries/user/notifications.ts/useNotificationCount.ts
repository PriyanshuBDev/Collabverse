import { getNotificationCount } from "@/lib/axios/user/notifications/getNotificationCount";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";

export function useNotificationCount(workspaceId?: string) {
  const { id } = useCurrentUser();
  return useQuery({
    queryKey: ["user", id, "notification-count"],
    queryFn: () => getNotificationCount(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
