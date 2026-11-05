export default function ProjectProgressBar({
  current,
  total,
  shimmer,
  height,
}: {
  current: number;
  total: number;
  shimmer?: boolean;
  height: string;
}) {
  const progress = total > 0 ? Math.floor((current / total) * 100) : 0;
  const getGradient = () => {
    if (progress <= 50)
      return "bg-gradient-to-r from-red-500 via-yellow-500 to-yellow-400";
    return "bg-gradient-to-r from-yellow-400 via-green-500 to-green-600";
  };
  return (
    <div className="w-full flex items-center gap-1">
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} relative overflow-hidden`}
      >
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out ${getGradient()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {shimmer && progress > 8 && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-[-50%] w-[200%] h-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          )}
        </div>
      </div>
      <div className="w-fit text-xs  text-gray-500 dark:text-gray-300 ">
        {progress}%
      </div>
    </div>
  );
}
