"use client";
import { useSearchParams } from "next/navigation";

export default function Unauthorize() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const messageMap: Record<string, string> = {
    workspace: "You don't have access to this workspace.",
    project: "You don't have access to this project.",
    task: "You don't have access to this task.",
  };
  const message =
    (from && messageMap[from]) || "You are not authorized to view this page.";
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen p-4 text-center bg-gray-50 dark:bg-blk3">
      <h1 className="text-3xl font-bold text-red-600">{message}</h1>
    </div>
  );
}
