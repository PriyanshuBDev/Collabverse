import { currentConversationProps } from "@/app/interfaces";
import ConversationProvider from "@/components/wrappers/ConversationProvider";
import { getCurrentConversation } from "@/lib/api/workspace/conversation/getCurrentConversation";

export default async function Layout({
  children,
  params: paramsPromise,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ workspace: string; conversationId: string }>;
}>) {
  const params = await paramsPromise;
  const { conversationId, workspace } = await params;
  const slug = decodeURIComponent(workspace);
  const data: currentConversationProps = await getCurrentConversation(
    conversationId,
    slug,
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 relative h-dvh dark:bg-blk2 w-full">
      <ConversationProvider data={data}>{children}</ConversationProvider>
    </div>
  );
}
