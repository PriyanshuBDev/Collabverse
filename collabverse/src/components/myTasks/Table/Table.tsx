import { projectAuthorityRole, viewTasksProps } from "@/app/interfaces";
import TableContent from "./TableContent";

export default function Table({
  tasks,
  role,
  projectSlug,
}: {
  tasks: viewTasksProps[];
  role: projectAuthorityRole;
  projectSlug: string;
}) {
  return (
    <div className="relative overflow-x-auto overflow-y-auto pb-8 rounded-lg mt-2 max-h-80  shadow-sm thinScrollbar">
      <table className="min-w-[800px] w-full table-fixed  text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[13%]" />
          <col className="w-[14%]" />
          <col className="w-[5%] lg:w-[3%]" />
        </colgroup>
        <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-200 dark:bg-blk4 dark:text-gray-400 z-20 shadow-md">
          <tr>
            <th scope="col" className="px-6 py-2 lg:py-3 ">
              Task Name
            </th>

            <th scope="col" className="px-6 py-2 lg:py-3">
              Subtasks
            </th>
            <th scope="col" className="px-6 py-2 lg:py-3">
              Members
            </th>
            <th scope="col" className="px-6 py-2 lg:py-3">
              Due Date
            </th>
            <th scope="col" className="px-6 py-2 lg:py-3">
              Priority
            </th>
            <th scope="col" className="px-1 py-2 lg:py-3"></th>
          </tr>
        </thead>
        <tbody className="lg:text-base text-xs ">
          {tasks.map((t: viewTasksProps) => (
            <TableContent
              key={t.id}
              t={t}
              projectSlug={projectSlug}
              role={role}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
