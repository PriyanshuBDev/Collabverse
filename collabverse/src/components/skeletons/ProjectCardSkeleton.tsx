export default function ProjectCardSkeleton({
  count = 6,
  colSpan,
  width,
  height,
  round,
  bg,
  insideBg,
}: {
  count?: number;
  colSpan?: string;
  width?: string;
  height?: string;
  round?: string;
  bg?: string;
  insideBg?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_: unknown, i: number) => (
        <div
          key={i}
          className={`${bg ?? "bg-gray-200 dark:bg-blk5"} ${colSpan ?? "col-span-1"} ${height ?? "h-35 lg:h-40"} ${round ?? "rounded-xl"} ${width ?? "w-full"}  p-3 lg:p-5 animate-pulse`}
        >
          <div className="flex items-center gap-3">
            <div className="w-fit">
              <div
                className={`w-8 h-8 xl:h-10 xl:w-10 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk7"}`}
              ></div>
            </div>
            <div
              className={`w-full h-7 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk7"}`}
            ></div>
          </div>
          <div
            className={`w-full rouned-md h-4 mt-1 xl:mt-2 ${insideBg ?? "bg-gray-300 dark:bg-blk7"}`}
          ></div>
          <div
            className={` mt-2 xl-mt-3 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk7"} w-full h-6`}
          ></div>
          <div
            className={` mt-2 xl-mt-3 rounded-full ${insideBg ?? "bg-gray-300 dark:bg-blk7"} w-full h-4`}
          ></div>
        </div>
      ))}
    </>
  );
}
