import { getDmUserData } from "@/lib/axios/workspace/conversation/dm/getDmUserData";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";
import { useMuteMutation } from "../useMuteMutation";
import { DmUserData } from "@/app/interfaces";

export function useDmUserData() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const queryKey = [workspaceId, "Conversation", conversationId, "dm-data"];

  const DmData = useQuery({
    queryKey,
    queryFn: () => getDmUserData({ workspaceId, conversationId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const muteMutation = useMuteMutation<DmUserData>(
    queryKey,
    DmData?.data?.name ?? "unknown",
    conversationId,
  );
  return { ...DmData, muteMutation };
}
