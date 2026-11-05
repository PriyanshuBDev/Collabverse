export default function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg mt-2 w-full animate-pulse">
      <div className="bg-gray-200 dark:bg-blk4 w-full h-10"></div>
      {Array.from({ length: 10 }).map((_: unknown, i: number) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-blk3 w-full h-16 border-b dark:border-gray-700 border-gray-200"
        ></div>
      ))}
    </div>
  );
}
