export default function ThreeDots({
  color,
  size,
  addOns,
}: {
  color?: string;
  size?: string;
  addOns?: string;
}) {
  return (
    <div className={`flex flex-row gap-2 ${addOns}`}>
      <div
        className={`${size ?? "size-4"} rounded-full ${color ?? "bg-gray-700 dark:bg-gray-200"} animate-bounce `}
      ></div>
      <div
        className={`${size ?? "size-4"} rounded-full ${color ?? "bg-gray-700 dark:bg-gray-200"} animate-bounce [animation-delay:-.2s]`}
      ></div>
      <div
        className={`${size ?? "size-4"} rounded-full ${color ?? "bg-gray-700 dark:bg-gray-200"} animate-bounce [animation-delay:-.3s]`}
      ></div>
    </div>
  );
}
