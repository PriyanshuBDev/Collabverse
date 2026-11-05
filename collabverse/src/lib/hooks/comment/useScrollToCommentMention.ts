import { commentMentions } from "@/app/interfaces";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCurrentUser from "../useCurrentUser";

export function useScrollToCommentMention(
  commentMentions: commentMentions[],
  jumpToComments: (id: string) => Promise<void> | void,
) {
  const { id: currentUserId } = useCurrentUser();
  const [localSeenMentions, setLocalSeenMentions] = useState<Set<string>>(
    new Set(),
  );
  const pendingScrollToRef = useRef<string | null>(null);

  const mentions = useMemo(
    () =>
      (commentMentions ?? [])
        .filter(
          (mention: commentMentions) =>
            mention.mentionedUserId === currentUserId &&
            !mention.seen &&
            !localSeenMentions.has(mention.commentId),
        )
        .sort(
          (a: commentMentions, b: commentMentions) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [commentMentions, currentUserId, localSeenMentions],
  );

  const handleScrollToLatestMention = useCallback(() => {
    const target = mentions[0];
    if (!target) return;

    pendingScrollToRef.current = target.commentId;
    setLocalSeenMentions((previous) => new Set(previous).add(target.commentId));
  }, [mentions]);

  useEffect(() => {
    const id = pendingScrollToRef.current;
    if (!id) return;

    pendingScrollToRef.current = null;
    void Promise.resolve(jumpToComments(id)).catch(console.error);
  }, [jumpToComments, localSeenMentions]);

  return {
    remainingMentions: mentions.length,
    handleScrollToLatestMention,
    showMention: mentions.length > 0,
  };
}
