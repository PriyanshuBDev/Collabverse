import RouteBackTask from "@/components/btns/task/RouteBackTask";
import AdditionalArea from "@/components/task/Additional/AdditionalArea";
import TaskArea from "@/components/task/Task/TaskArea";

export default async function TaskById() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 pb-10 px-5 pt-5">
      <RouteBackTask />
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 pb-10">
        <div className="mt-5 xl:col-span-3 col-span-1">
          <TaskArea />
        </div>
        <div className="mt-5 border-gray-500 xl:col-span-2 col-span-1">
          <AdditionalArea />
        </div>
      </div>
    </div>
  );
}
