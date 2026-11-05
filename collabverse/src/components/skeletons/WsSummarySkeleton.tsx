export default function WsSummarySkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_: unknown, i: number) => (
        <div
          key={i}
          className=" bg-gray-200 dark:bg-blk5 rounded-2xl animate-pulse col-span-1 h-33 w-full"
        ></div>
      ))}
    </>
  );
}
