"use client";

import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useMounted from "@/lib/hooks/useMounted";
import { useRouter } from "next/navigation";

export default function RouteBackTask() {
  const router = useRouter();
  const project = useCurrentProject();
  const workspace = useCurrentWorkspace();
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <button
      className="flex items-center gap-2 border-gray-300 dark:border-gray-700 border-3 hover:bg-gray-300 dark:hover:bg-gray-500 dark:bg-blk4 text-gray-900 dark:text-gray-200 rounded-lg px-2 py-0.5 cursor-pointer bg-white h-fit"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(`/app/${workspace.slug}/projects/${project.slug}`);
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-3 lg:size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
      Back
    </button>
  );
}
