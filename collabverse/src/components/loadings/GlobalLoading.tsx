import Spinner1 from "@/components/loadings/Spinner1";

export default function GlobalLoading() {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-50 dark:bg-blk3">
      <Spinner1 size="size-10 lg:size-14"></Spinner1>
    </div>
  );
}
