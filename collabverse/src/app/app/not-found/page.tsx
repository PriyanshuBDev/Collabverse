export default function NotFound() {
  return (
    <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen bg-gray-50 dark:bg-blk3">
      <h1 className="text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-bold dark:text-white">
        404
      </h1>
      <div className="text-sm md:text-base lg:text-lg 2xl:text-xl">
        Page Not Found
      </div>
    </div>
  );
}
