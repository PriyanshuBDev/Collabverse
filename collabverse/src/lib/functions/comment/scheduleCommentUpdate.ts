import { useCommentStore } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";

let queue: (() => void)[] = [];
let scheduled = false;

export function scheduleCommentUpdate(fn: () => void) {
  queue.push(fn);
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      const tasks = [...queue];
      queue = [];
      scheduled = false;
      useCommentStore.setState((state) => {
        tasks.forEach((t) => t());
        return { ...state };
      });
    });
  }
}
