export default function SearchbarSkeleton({
  width,
  height,
  round,
  bg,
}: {
  width?: string;
  height?: string;
  round?: string;
  bg?: string;
}) {
  return (
    <div
      className={`${bg ?? "bg-gray-200 dark:bg-blk5 "} ${width ?? "w-full max-w-md"} ${round ?? "rounded-full"} ${height ?? "h-12"}  animate-pulse`}
    ></div>
  );
}
