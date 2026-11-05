import ChatSidebar from "@/components/conversation/sidebar/ChatSidebar";
import { ConversationRealtimeHost } from "@/components/wrappers/ConversationRealtimeHost";
import { ConvoRTChannelProvider } from "@/components/wrappers/ConvoRtChannelProvider";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex relative h-full dark:bg-blk2 w-full">
      <ConvoRTChannelProvider>
        <ConversationRealtimeHost>
          <ChatSidebar />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <main
              className="flex flex-1 flex-col min-h-0  overflow-auto transition-all duration-300 dark:bg-blk2 bg-gray-50 ease-in-out ml-0 mt-0  dark:text-white text-gray-900"
              id="chat-main"
            >
              {children}
            </main>
          </div>
        </ConversationRealtimeHost>
      </ConvoRTChannelProvider>
    </div>
  );
}
