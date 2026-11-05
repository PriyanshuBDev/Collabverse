import {
  convoListResProps,
  getConversationList,
} from "@/lib/axios/workspace/conversation/sidebar/getConversationList";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { useSidebarStore } from "@/lib/hooks/zustand/useSidebarStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useConversationList(search?: string) {
  const { id: workspaceId } = useCurrentWorkspace();
  const actualSearch = useSearch(search);
  const { merge, mergeSearch } = useSidebarStore();
  const queryKey = [
    workspaceId,
    "conversations",
    "sidebar",
    actualSearch ?? "",
  ];
  const convo = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getConversationList({
        workspaceId,
        cursor: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    const allData =
      convo.data?.pages.flatMap((p: convoListResProps) => p.conversations) ??
      [];
    if (actualSearch) {
      mergeSearch(allData);
    } else {
      merge(allData);
    }
  }, [convo.data, merge, mergeSearch, actualSearch]);
  return convo;
}
