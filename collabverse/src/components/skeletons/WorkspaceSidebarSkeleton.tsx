export default function WsSidebarSkeleton({ bg }: { bg?: string }) {
  return (
    <div
      className={`${bg ?? "bg-gray-200 dark:bg-blk5"} w-full rounded-lg   p-2  animate-pulse mt-3`}
    >
      <div className="flex items-center gap-3">
        <div className="w-fit">
          <div
            className={`w-8 h-8 xl:h-10 xl:w-10 rounded-md ${bg ?? "bg-gray-300 dark:bg-blk4"}`}
          ></div>
        </div>
        <div
          className={`w-full h-8 rounded-md ${bg ?? "bg-gray-300 dark:bg-blk4"}`}
        ></div>
      </div>
    </div>
  );
}
