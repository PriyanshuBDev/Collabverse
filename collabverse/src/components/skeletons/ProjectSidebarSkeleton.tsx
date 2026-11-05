export default function ProjectSidebarSkeleton({
  count = 6,
  bg,
}: {
  count?: number;
  bg?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_: unknown, i: number) => (
        <div className="flex items-center gap-3 p-2 animate-pulse" key={i}>
          <div className="w-fit">
            <div
              className={`w-5 h-5 lg:h-7 lg:w-7 rounded-md ${bg ?? "bg-gray-300 dark:bg-blk5"}`}
            ></div>
          </div>
          <div
            className={`w-full h-7 rounded-md ${bg ?? "bg-gray-300 dark:bg-blk5"}`}
          ></div>
        </div>
      ))}
    </>
  );
}
