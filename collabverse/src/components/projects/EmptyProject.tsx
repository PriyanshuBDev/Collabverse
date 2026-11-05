"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Plus } from "lucide-react";
import NewProjectModal from "./NewProjectModal";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";

export default function EmptyProject() {
  const [show, setShow] = useState(false);
  const { role, permissions } = useCurrentWorkspace();
  const canCreateProject =
    role === "Owner" || permissions.admin.includes("Create_Project");
  return (
    <MotionConfig reducedMotion="user">
      <>
        <main className="flex  items-center justify-center px-6 py-16 text-slate-900 dark:text-slate-100">
          <motion.section
            aria-labelledby="empty-project-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md text-center"
          >
            {/* A single project illustration, with a gentle drift */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto grid h-48 w-56 place-items-center"
            >
              <div className="absolute inset-x-6 inset-y-5 rounded-[2.5rem] bg-emerald-400/10 blur-2xl dark:bg-emerald-400/[0.08]" />

              <svg
                viewBox="0 0 240 180"
                role="img"
                aria-label="An empty project folder"
                className="relative w-52 drop-shadow-xl"
              >
                <defs>
                  <linearGradient
                    id="projectFolder"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="projectPaper" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ecfdf5" />
                  </linearGradient>
                </defs>

                {/* Soft ground shadow */}
                <ellipse
                  cx="120"
                  cy="151"
                  rx="68"
                  ry="9"
                  fill="#10b981"
                  fillOpacity=".12"
                />

                {/* Project notes behind the folder */}
                <motion.g
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <path
                    d="M76 37a8 8 0 0 1 8-8h49l12 12h20a8 8 0 0 1 8 8v70H76V37Z"
                    fill="url(#projectPaper)"
                    stroke="#a7f3d0"
                    strokeWidth="2"
                  />
                  <path
                    d="M94 58h55M94 70h38"
                    stroke="#a7b8ad"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="98" cy="88" r="5" fill="#a7f3d0" />
                  <path
                    d="m96 88 2 2 4-5"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M110 88h31"
                    stroke="#a7b8ad"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="98" cy="103" r="5" fill="#d1fae5" />
                  <path
                    d="M110 103h24"
                    stroke="#c2cec6"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </motion.g>

                {/* Folder */}
                <path
                  d="M49 81a10 10 0 0 1 10-10h48l12 12h52a10 10 0 0 1 10 10v39a10 10 0 0 1-10 10H59a10 10 0 0 1-10-10V81Z"
                  fill="url(#projectFolder)"
                  fillOpacity=".72"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <path
                  d="M51 96h128l-9 34a10 10 0 0 1-10 8H61a10 10 0 0 1-10-10V96Z"
                  fill="url(#projectFolder)"
                  stroke="#6ee7b7"
                  strokeWidth="2"
                />
                <path
                  d="M51 96h128"
                  stroke="#d1fae5"
                  strokeOpacity=".55"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>

            <h1
              id="empty-project-title"
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              No projects here yet
            </h1>

            {canCreateProject && (
              <>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Create a project to organize tasks, milestones, and the work
                  moving your team forward.
                </p>

                <motion.button
                  type="button"
                  onClick={() => setShow(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:text-emerald-950 dark:hover:bg-emerald-700 dark:focus:ring-offset-[#0b0b0d]"
                >
                  <Plus size={16} />
                  <div className="text-sm lg:text-lg">Create project</div>
                </motion.button>
              </>
            )}
          </motion.section>
        </main>

        <NewProjectModal setShow={setShow} show={show} />
      </>
    </MotionConfig>
  );
}
