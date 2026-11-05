import { CallScreens } from "@/components/Call/CallScreens";
import { IncomingCall } from "@/components/Call/IncomingCall";
import { CallChannelProvider } from "@/components/wrappers/CallChannelProvider";
import { CallProvider } from "@/components/wrappers/CallProvider";
import { CallSignalingProvider } from "@/components/wrappers/CallSignalingProvider";
import WorkspaceProvider from "@/components/wrappers/WorkspaceProvider";
import { getCurrentWsServer } from "@/lib/api/workspace/getCurrentWsServer";
import { currentWsProps } from "@/lib/queries/workspace/useWorkspace";

export default async function Dashboard({
  children,
  params: paramsPromise,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}>) {
  const params = await paramsPromise;
  const { workspace } = await params;
  const slug = decodeURIComponent(workspace);
  const initialWs: currentWsProps = await getCurrentWsServer(slug);

  return (
    <div className="flex relative h-screen dark:bg-blk2 w-full">
      <CallChannelProvider workspaceId={initialWs.id}>
        <WorkspaceProvider wsSlug={slug} initialWs={initialWs}>
          <CallSignalingProvider>
            <CallProvider>
              <>
                {children} <IncomingCall /> <CallScreens />
              </>
            </CallProvider>
          </CallSignalingProvider>
        </WorkspaceProvider>
      </CallChannelProvider>
    </div>
  );
}
