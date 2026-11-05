import { FlowSpaceChannelProvider } from "@/components/wrappers/FlowSpaceChannelProvider";
import ProjectProvider from "@/components/wrappers/ProjectProvider";

export default async function ProjectLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ projectSlug: string }>;
}) {
  const params = await paramsPromise;
  const { projectSlug } = await params;
  const slug = decodeURIComponent(projectSlug);
  return (
    <div className="flex relative h-screen dark:bg-blk2 w-full">
      <ProjectProvider slug={slug}>
        <FlowSpaceChannelProvider>{children}</FlowSpaceChannelProvider>
      </ProjectProvider>
    </div>
  );
}
