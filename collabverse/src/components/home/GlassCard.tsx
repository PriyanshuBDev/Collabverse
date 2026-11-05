import { ReactNode } from "react";

export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <article className="w-full rounded-3xl border border-white dark:border-blk7 bg-gray-200/80 dark:bg-blk4/80  p-4 shadow-lg shadow-black/10 dark:shadow-black/30 backdrop-blur-xl">
      {children}
    </article>
  );
}
