import { Dispatch, RefObject, SetStateAction } from "react";

export const updateCurrentDateFromScroll = (
  chatContainerRef: RefObject<HTMLDivElement | null>,
  setCurrentDate: Dispatch<SetStateAction<string | null>>,
) => {
  const container = chatContainerRef.current;
  if (!container) return;
  const dateEls = Array.from(
    container.querySelectorAll<HTMLElement>("[id^='date-']"),
  );
  if (dateEls.length === 0) {
    setCurrentDate(null);
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const anchorY = containerRect.top + 8;
  let activeDate: string | null = null;
  for (const el of dateEls) {
    const r = el.getBoundingClientRect();
    if (r.top <= anchorY) activeDate = el.id.replace("date-", "");
    else break;
  }
  if (!activeDate) {
    const firstVisible = dateEls.find((el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < containerRect.bottom && r.bottom > containerRect.top;
    });
    activeDate = firstVisible ? firstVisible.id.replace("date-", "") : null;
  }
  setCurrentDate((prev) => (prev === activeDate ? prev : activeDate));
};
