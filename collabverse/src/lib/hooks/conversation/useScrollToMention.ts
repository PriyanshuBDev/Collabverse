import { convoDetailsProps, mentionProps } from "@/app/interfaces";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCurrentUser from "../useCurrentUser";

export function useScrollToMention(
  convoDetails: convoDetailsProps,
  jumpToMessage: (id: string) => Promise<void> | void,
) {
  const { id: currentUserId } = useCurrentUser();
  const [localSeenMentions, setLocalSeenMentions] = useState<Set<string>>(
    new Set(),
  );
  const pendingScrollToRef = useRef<string | null>(null);

  const mentions = useMemo(
    () =>
      (convoDetails.mentions ?? [])
        .filter(
          (mention: mentionProps) =>
            mention.userId === currentUserId &&
            !mention.seen &&
            !localSeenMentions.has(mention.messageId),
        )
        .sort(
          (a: mentionProps, b: mentionProps) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [convoDetails.mentions, currentUserId, localSeenMentions],
  );

  const handleScrollToLatestMention = useCallback(() => {
    const target = mentions[0];
    if (!target) return;

    pendingScrollToRef.current = target.messageId;
    setLocalSeenMentions((previous) => new Set(previous).add(target.messageId));
  }, [mentions]);

  useEffect(() => {
    const id = pendingScrollToRef.current;
    if (!id) return;

    pendingScrollToRef.current = null;
    void Promise.resolve(jumpToMessage(id)).catch(console.error);
  }, [jumpToMessage, localSeenMentions]);

  return {
    remainingMentions: mentions.length,
    handleScrollToLatestMention,
    showMention: mentions.length > 0,
  };
}
