import { useEffect, useRef } from "react";

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  rootMargin = "200px",
}: {
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, rootMargin]);

  return ref;
}
