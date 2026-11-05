import { useMemo, useState } from "react";
import Table from "./Table";
import { projectAuthorityRole, viewTasksProps } from "@/app/interfaces";
import { TaskStatus } from "@prisma/client";
import { statusMap } from "@/lib/functions/task/status/statusTransition";

export default function TableByStatus({
  title,
  role,
  tasks,
  projectSlug,
}: {
  title: TaskStatus;
  role: projectAuthorityRole;
  tasks: viewTasksProps[];
  projectSlug: string;
}) {
  const { svg, bg, text, border } = useMemo(() => {
    switch (title) {
      case "To_Do":
        return {
          svg: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="lg:size-4 size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          ),
          bg: "bg-blue-300",
          text: "text-blue-700",
          border: "border-blue-500",
        };
      case "In_Progress":
        return {
          svg: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="lg:size-4 size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          ),
          bg: "bg-yellow-300",
          text: "text-yellow-700",
          border: "border-yellow-500",
        };
      case "In_Review":
        return {
          svg: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="lg:size-4 size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
              />
            </svg>
          ),
          bg: "bg-violet-300",
          text: "text-violet-700",
          border: "border-violet-500",
        };
      case "Done":
        return {
          svg: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="lg:size-4 size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
              />
            </svg>
          ),
          bg: "bg-green-300",
          text: "text-green-700",
          border: "border-greeen-500",
        };
      default:
        return { svg: null, bg: "", text: "" };
    }
  }, [title]);
  const [show, setShow] = useState(true);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 transition-all duration-300">
        <div
          onClick={() => {
            setShow((prev) => !prev);
          }}
          className="cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div
          className={`flex items-center gap-1 ${bg} ${text} rounded-md px-2 py-0.5 text-xs lg:text-sm ${border} border`}
        >
          {svg}
          {statusMap(title)}
        </div>
        <div className="dark:text-gray-700 text-gray-400 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 lg:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </div>
        <div className="bg-gray-200 dark:bg-blk4 dark:text-gray-300 text-gray-700 rounded-md border border-gray-400 dark:border-gray-600 px-2 py-0.5 text-xs lg:text-sm">
          {tasks.length}
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out px-3 sm:px-5 ${
          show
            ? "opacity-100 translate-y-0 max-h-[1000px]"
            : "opacity-0 -translate-y-10 max-h-0 pointer-events-none"
        }`}
      >
        <Table tasks={tasks} projectSlug={projectSlug} role={role}></Table>
      </div>
    </div>
  );
}
