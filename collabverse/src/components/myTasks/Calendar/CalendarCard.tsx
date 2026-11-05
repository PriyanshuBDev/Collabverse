import { viewTasksProps } from "@/app/interfaces";
import getPriorityBgColor from "@/lib/functions/colors/getPriorityBgColor";
import getStatusBorderColor from "@/lib/functions/colors/getStatusBorderColor";
import { statusMap } from "@/lib/functions/task/status/statusTransition";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useRouter } from "next/navigation";

export default function CalendarCard({
  task,
  idx,
  projectSlug,
}: {
  task: viewTasksProps;
  idx: number;
  projectSlug: string;
}) {
  const { slug } = useCurrentWorkspace();
  const router = useRouter();
  return (
    <div
      key={idx}
      className={`${getStatusBorderColor(
        statusMap(task.status),
      )} ${task.currentUserTaskRole ? "cursor-pointer" : ""} border-l-4 2xl:border-l-6 border 2xl:border-2 rounded-md bg-gray-200 dark:bg-blk4 mt-2 p-0.5 2xl:p-2 w-full h-fit ${
        idx !== 0 ? "md:-ml-23 2xl:-ml-33" : ""
      }  transition-all`}
      style={{ zIndex: idx + 1 }}
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = "999")}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = String(idx + 1))}
      onClick={() => {
        if (task.currentUserTaskRole) {
          router.push(
            `/app/${slug}/projects/${projectSlug}/tasks/${task.slug}`,
          );
        }
      }}
    >
      <div className="flex justify-between">
        <div className="text-gray-900 dark:text-gray-100 font-semibold text-[8px] md:text-[10px] lg:text-xs 3xl:text-sm ">
          {task.name}
        </div>{" "}
      </div>
      <div className="flex items-center gap-1 2xl:gap-2 mt-1 xl:mt-2">
        <div
          className={`${getPriorityBgColor(
            task.priority,
          )} px-0.5 2xl:px-1 2xl:py-0.5 rounded-md text-[8px] md:text-[10px] lg:text-xs 3xl:text-sm`}
        >
          {task.priority}
        </div>
      </div>
    </div>
  );
}
