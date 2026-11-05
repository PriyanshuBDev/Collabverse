import { useCallback, useEffect, useRef, useState } from "react";

type UseHandleScrollToMsgOptions = {
  getMessageIndex: (messageId: string) => number;
  scrollToIndex: (index: number) => void;
};

export function useHandleScrollToMsg({
  getMessageIndex,
  scrollToIndex,
}: UseHandleScrollToMsgOptions) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollTo = useCallback(
    (messageId: string) => {
      const index = getMessageIndex(messageId);
      if (index < 0) return;

      setHighlightId(messageId);
      scrollToIndex(index);

      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => {
        setHighlightId(null);
        highlightTimer.current = null;
      }, 2000);
    },
    [getMessageIndex, scrollToIndex],
  );

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  return { highlightId, handleScrollTo, setHighlightId };
}
