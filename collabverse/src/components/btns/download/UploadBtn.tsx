import { CircularProgress } from "@/components/progress/CircularProgress";

export function UploadBtn({
  progress,
  cancel,
}: {
  progress: number;
  cancel: () => void;
}) {
  return (
    <div
      className={`group relative shadow-md  rouned-full p-2 z-20 rounded-full cursor-pointer  bg-blue-300 dark:bg-blue-700/50 text-gray-800 dark:text-gray-100`}
    >
      <button className="relative w-5 h-5 lg:w-7 lg:h-7 rounded-full flex items-center justify-center  cursor-pointer">
        <CircularProgress
          progress={progress}
          size={30}
          stroke={3}
          svgSize="size-3"
          cancelDownload={cancel}
        />
      </button>
    </div>
  );
}
