

let queue: (() => void)[] = [];
let scheduled = false;

export function scheduleUpdate(fn: () => void) {
  queue.push(fn);

  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(() => {
    const tasks = queue;
    queue = [];
    scheduled = false;

    tasks.forEach((task) => task());
  });
}
