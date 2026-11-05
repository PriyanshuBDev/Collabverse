"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";

import { createPortal } from "react-dom";
import { projectProps } from "@/app/interfaces";
import NewProjectModal from "../projects/NewProjectModal";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useMounted from "@/lib/hooks/useMounted";
import useIsDark from "@/lib/hooks/useIsDark";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";
import { useProjectSidebar } from "@/lib/queries/workspace/project/useProjectSidebar";
import ProjectSidebarSkeleton from "../skeletons/ProjectSidebarSkeleton";
import { toast } from "sonner";
import RedirectBtn from "../btns/RedirectBtn";

export default function ProjectSelector() {
  const [show, setShow] = useState(false);
  const mounted = useMounted();
  const { data, isLoading, isError } = useProjectSidebar();
  const memPermToCreate = useIsAllowed("Create_Project", "member");
  const adminPermToCreate = useIsAllowed("Create_Project", "admin");
  const isDark = useIsDark();
  const pathname = usePathname();
  const { slug, role } = useCurrentWorkspace();

  const pathSegments = pathname.split("/").filter(Boolean);
  const active = pathSegments[2] === "projects" && !pathSegments[3];
  const router = useRouter();
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong while fetching projects");
    }
  }, [isError]);
  if (!mounted) return null;

  return (
    <div className="h-full flex flex-col border-t-2 border-dashed border-gray-400 dark:border-gray-700 relative pb-6">
      <div className="flex justify-between items-center w-full pt-3 px-1 flex-shrink-0">
        <div
          className={`text-gray-500 text-sm font-semibold dark:text-gray-100 hover:underline cursor-pointer ${
            active ? "underline" : ""
          }`}
          onClick={() => {
            router.push(`/app/${slug}/projects/all`);
          }}
        >
          PROJECTS
        </div>
        {(role === "Owner" ||
          (role === "Member" && memPermToCreate) ||
          (role === "Admin" && adminPermToCreate)) && (
          <div
            className="cursor-pointer text-gray-700 dark:text-gray-400"
            onClick={() => {
              setShow((prev) => !prev);
            }}
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col mt-3 ">
          <ProjectSidebarSkeleton />
        </div>
      ) : data && data.projects.length > 0 ? (
        <div
          className="mt-3 flex-1 overflow-y-auto pr-1 blueScrollbar"
          style={{ scrollbarWidth: "thin" }}
        >
          {data.projects.map((p: projectProps, idx: number) => {
            const isActive = pathname.startsWith(
              `/app/${slug}/projects/${p.slug}`,
            );
            return (
              <div
                key={idx}
                className={`cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-700 focus:outline-none  font-medium rounded-lg px-2 py-2  mb-1 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white"
                    : ""
                }`}
                onClick={() => {
                  router.push(`/app/${slug}/projects/${p.slug}`);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {p.avatar ? (
                      <div className="relative w-5 h-5 lg:h-7 lg:w-7 rounded-md overflow-hidden ">
                        <Image
                          alt={"MembersAvatar"}
                          src={p.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 lg:h-7 lg:w-7 rounded-md flex justify-center items-center  font-semibold text-xs text-white`}
                        style={{ background: gradientBgFromName(p.name) }}
                      >
                        {getInitials(p.name)}
                      </div>
                    )}
                  </div>
                  {p.name}
                </div>
              </div>
            );
          })}
          {data.hasMore && (
            <div className="w-full flex justify-center">
              <RedirectBtn
                label="View All"
                direct={`/app/${slug}/projects`}
              ></RedirectBtn>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-sm h-full flex justify-center items-center w-full">
          No projects found
        </div>
      )}

      {createPortal(
        <NewProjectModal setShow={setShow} show={show}></NewProjectModal>,
        document.body,
      )}
    </div>
  );
}
