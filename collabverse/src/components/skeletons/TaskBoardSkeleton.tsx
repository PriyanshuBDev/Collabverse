export default function TaskBoardSkeleton({
  width,
  height,
  round,
  bg,
  insideBg,
  count = 5,
  row,
}: {
  width?: string;
  height?: string;
  round?: string;
  bg?: string;
  insideBg?: string;
  count?: number;
  row?: boolean;
}) {
  return (
    <div className={`flex ${!row ? "flex-col gap-3" : "gap-5"}  w-full`}>
      {Array.from({ length: count }).map((_: unknown, i: number) => (
        <div
          key={i}
          className={`${bg ?? "bg-gray-50 dark:bg-blk6"} col-span-1 ${height ?? "h-35 lg:h-40"} ${round ?? "rounded-xl"} ${width ?? "w-full"}  p-3 animate-pulse`}
        >
          <div className="flex w-full justify-between gap-3">
            <div className="w-fit">
              <div
                className={`w-10 h-5 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"}`}
              ></div>
            </div>
            <div
              className={`w-15 h-5 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"}`}
            ></div>
          </div>
          <div
            className={`w-full rounded-md h-5 mt-3 lg:mt-4 ${insideBg ?? "bg-gray-300 dark:bg-blk8"}`}
          ></div>
          <div
            className={` mt-2 lg:mt-3 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"} w-full h-3`}
          ></div>
          <div className="flex  w-full justify-between gap-3 mt-3">
            <div className="w-fit">
              <div
                className={`w-15 h-4 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"}`}
              ></div>
            </div>
            <div
              className={`w-25 h-4 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"}`}
            ></div>
          </div>
          <div
            className={` mt-2 lg:mt-3 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk8"} w-full h-5`}
          ></div>
        </div>
      ))}
    </div>
  );
}
export function SearchTaskSkeleton() {}
