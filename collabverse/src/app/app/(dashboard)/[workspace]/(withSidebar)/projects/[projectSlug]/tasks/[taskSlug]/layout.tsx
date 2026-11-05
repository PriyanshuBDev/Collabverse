import { TaskCommentRTChannelProvider } from "@/components/wrappers/TaskCommentProvider";
import { TaskCommentRealtimeHost } from "@/components/wrappers/TaskCommentRealtimeHost";
import TaskProvider from "@/components/wrappers/TaskProvider";

export default async function TaskLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ taskSlug: string }>;
}) {
  const params = await paramsPromise;
  const { taskSlug } = await params;
  const slug = decodeURIComponent(taskSlug);
  return (
    <div className="flex relative h-screen dark:bg-blk2 w-full">
      <TaskProvider slug={slug}>
        <TaskCommentRTChannelProvider>
          <TaskCommentRealtimeHost>{children}</TaskCommentRealtimeHost>
        </TaskCommentRTChannelProvider>
      </TaskProvider>
    </div>
  );
}
