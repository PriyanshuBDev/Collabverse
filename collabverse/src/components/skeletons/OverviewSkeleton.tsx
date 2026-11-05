export default function OverviewSkeleton({ height }: { height?: string }) {
  return (
    <div
      className={`${height ?? "h-110"}  bg-gray-200 dark:bg-blk5 rounded-lg animate-pulse`}
    ></div>
    // <div className="w-full h-full ">
    //   <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 pb-10">
    //     <div
    //       className={`${lHeight ?? "h-80"} mt-5 xl:col-span-3 col-span-1 bg-gray-200 dark:bg-blk5`}
    //     ></div>
    //     <div
    //       className={`${rHeight ?? "h-110"} mt-5 border-gray-500 xl:col-span-2 col-span-1 bg-gray-200 dark:bg-blk5`}
    //     ></div>
    //   </div>
    // </div>
  );
}
