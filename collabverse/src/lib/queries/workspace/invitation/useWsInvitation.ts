import { getInvitationData } from "@/lib/axios/workspace/invitation/getInvitationData";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useWsInvitation() {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "invitation"],
    queryFn: () => getInvitationData(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
