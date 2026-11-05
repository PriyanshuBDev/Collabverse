import PriorityCard from "@/components/overview/PriorityCard";
import ProductivityCard from "@/components/overview/ProductivityCard";
import ProjectCompletionCard from "@/components/overview/ProjectCompletionCard";
import RecentProject from "@/components/overview/RecentProject";
import TaskStatusCard from "@/components/overview/TaskStatusCard";
import TeamLoadCard from "@/components/overview/TeamLoadCard";
import UpcomingTasks from "@/components/overview/UpcomingTasks";
import WorkspaceSummary from "@/components/overview/WorkspaceSummary";
import WsActivityArea from "@/components/overview/WsActivityArea";

export default function Overview() {
  return (
    <div className="dark:text-white w-full h-screen overflow-y-auto text-gray-900  p-5 ">
      <WorkspaceSummary />
      <div className="grid lg:grid-cols-3 grid-cols-1 w-full gap-5">
        {" "}
        <div className="col-span-1 lg:h-85 h-65">
          <WsActivityArea />
        </div>{" "}
        <div className="lg:col-span-2 col-span-1  lg:h-85 h-65">
          <ProductivityCard />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-5 mt-5">
        {" "}
        <div className="col-span-1 lg:h-85 h-65">
          <TaskStatusCard />
        </div>{" "}
        <div className="col-span-1 lg:h-85 h-65">
          <TeamLoadCard />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-1 w-full gap-5 mt-5 ">
        <div className="lg:col-span-2 col-span-1 lg:h-85 h-65">
          <RecentProject />
        </div>{" "}
        <div className="col-span-1 lg:h-85 h-65">
          <ProjectCompletionCard />
        </div>{" "}
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-5 mt-5 pb-10 ">
        {" "}
        <div className="col-span-1 lg:h-85 h-65">
          <PriorityCard />
        </div>{" "}
        <div className="col-span-1 lg:h-85 h-65">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}
