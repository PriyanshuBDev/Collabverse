import { useCallback, useEffect, useRef, useState } from "react";

type UseHandleScrollToCommentOptions = {
  getCommentIndex: (commentId: string) => number;
  scrollToIndex: (index: number) => void;
};

export function useHandleScrollToComment({
  getCommentIndex,
  scrollToIndex,
}: UseHandleScrollToCommentOptions) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollTo = useCallback(
    (commentId: string) => {
      const index = getCommentIndex(commentId);
      if (index < 0) return;

      setHighlightId(commentId);
      scrollToIndex(index);

      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => {
        setHighlightId(null);
        highlightTimer.current = null;
      }, 2000);
    },
    [getCommentIndex, scrollToIndex],
  );

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  return { highlightId, handleScrollTo, setHighlightId };
}
