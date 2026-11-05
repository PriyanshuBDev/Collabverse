"use client";
import ProjectActivityArea from "./ProjectActivityArea";
import ProjectOverview from "./ProjectOverview";

export default function OverviewArea() {
  return (
    <div className="w-full h-full ">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 pb-10">
        <div className="mt-5 xl:col-span-3 col-span-1">
          <ProjectOverview />
        </div>
        <div className="mt-5 border-gray-500 xl:col-span-2 col-span-1">
          <ProjectActivityArea />
        </div>
      </div>
    </div>
  );
}
