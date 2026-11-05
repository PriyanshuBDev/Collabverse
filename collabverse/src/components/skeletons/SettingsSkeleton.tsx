export default function SettingsSkeleton({
  bg,
  height,
  count = 3,
}: {
  bg?: string;
  height?: string;
  count?: number;
}) {
  return Array.from({ length: count }).map((_: unknown, i: number) => (
    <div key={i} className="mt-5 max-w-3xl w-full mx-auto ">
      <div
        className={`${bg ?? "bg-gray-200 dark:bg-blk5"} w-full rounded-lg   p-5  animate-pulse  `}
      >
        <div
          className={`w-full ${height ?? "h-50"} rounded-lg ${bg ?? "bg-gray-300 dark:bg-blk4"}`}
        ></div>
      </div>
    </div>
  ));
}
