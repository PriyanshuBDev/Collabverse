export default function WsCardSkeleton({
  width,
  height,
  round,
  bg,
  insideBg,
}: {
  width?: string;
  height?: string;
  round?: string;
  bg?: string;
  insideBg?: string;
}) {
  return (
    <div
      className={`${bg ?? "bg-gray-200 dark:bg-blk5"} col-span-1 ${height ?? "h-35 lg:h-40"} ${round ?? "rounded-xl"} ${width ?? "w-full"}  p-3 lg:p-5`}
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
        className={`w-full rounded-md h-4 mt-1 xl:mt-2 ${insideBg ?? "bg-gray-300 dark:bg-blk7"}`}
      ></div>
      <div
        className={` mt-2 xl:mt-3 rounded-md ${insideBg ?? "bg-gray-300 dark:bg-blk7"} w-full h-12`}
      ></div>
    </div>
  );
}
