import ProjectProvider from "@/components/wrappers/ProjectProvider";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectSlug: string };
}) {
  const { projectSlug } = await params;
  const slug = decodeURIComponent(projectSlug);
  return (
    <div className="flex relative h-screen dark:bg-blk2 w-full">
      <ProjectProvider slug={slug}>{children}</ProjectProvider>
    </div>
  );
}
