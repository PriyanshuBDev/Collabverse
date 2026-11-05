export default function ProjectUserPickerSkeleton({
  bg,
  count = 12,
}: {
  bg?: string;
  count?: number;
}) {
  return Array.from({ length: count }).map((_: unknown, i: number) => (
    <div
      key={i}
      className={`${bg ?? "bg-gray-200 dark:bg-blk5"} w-full rounded-lg   p-1 px-2  animate-pulse mt-0.5`}
    >
      <div className="flex items-center gap-3">
        <div className="w-fit">
          <div
            className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full ${bg ?? "bg-gray-300 dark:bg-blk4"}`}
          ></div>
        </div>
        <div
          className={`w-full h-7 rounded-md ${bg ?? "bg-gray-300 dark:bg-blk4"}`}
        ></div>
      </div>
    </div>
  ));
}
