import ProjectContentArea from "./ProjectContentArea";
import { useProjectOverview } from "@/lib/queries/workspace/project/overview/useProjectOverview";
import OverviewSkeleton from "@/components/skeletons/OverviewSkeleton";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
export default function ProjectOverview() {
  const { data, isLoading, isError, error } = useProjectOverview();
  useIsErrorToast(isError, "Failed to fetch project", error);
  if (isLoading) return <OverviewSkeleton />;
  if (!data)
    return (
      <div className="h-[300px] text-gray-600 dark:text-gray-400 text-sm lg:text-lg">
        No details found
      </div>
    );
  return <ProjectContentArea project={data} />;
}
