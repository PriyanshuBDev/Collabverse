export default function UserGridSkeleton({ count = 12 }: { count?: number }) {
  return Array.from({ length: count }).map((_: unknown, i: number) => (
    <div
      key={i}
      className="rounded-xl lg:p-5 p-3 bg-gray-100 dark:bg-blk3 h-40 md:h-45 lg:h-50 dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]  shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1"
    >
      <div className="w-9 h-9 lg:h-12 lg:w-12 rounded-full bg-gray-200 dark:bg-blk4"></div>
      <div className="h-3 lg:h-4 bg-gray-200 dark:bg-blk4 rounded-md w-[calc(100%-1rem)] mt-1 "></div>
      <div className="h-2 lg:h-3 bg-gray-200 dark:bg-blk4 rounded-md w-[calc(100%-1.75rem)] "></div>
      <div className="h-2 lg:h-3 bg-gray-200 dark:bg-blk4 rounded-md w-[calc(100%-1rem)] "></div>
      <div className="h-2 lg:h-3 bg-gray-200 dark:bg-blk4 rounded-md w-[calc(100%-0.5rem)] "></div>
      <div className="h-6 lg:h-8 bg-gray-200 dark:bg-blk4 rounded-md mt-1 w-[calc(100%-0.75rem)] "></div>
    </div>
  ));
}
