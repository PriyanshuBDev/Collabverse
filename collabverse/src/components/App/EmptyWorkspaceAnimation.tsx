"use client";

import { motion, MotionConfig } from "framer-motion";
import { FolderKanban, ListTodo, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import NewWsModal from "../btns/workspace/NewWsModal";

export default function EmptyWorkspace() {
  const [show, setShow] = useState(false);
  return (
    <>
      <MotionConfig reducedMotion="user">
        <main className="relative flex items-center justify-center overflow-hidden  px-5 py-16 text-slate-900 transition-colors  dark:text-slate-100">
          {/* Soft emerald ambience */}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md text-center"
          >
            {/* Illustration stage */}
            <div className="relative mx-auto mb-8 h-56 w-full max-w-xs">
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.65, 0.9, 0.65] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-x-9 top-9 h-36 rounded-[2rem] border border-emerald-300/40 bg-gradient-to-br from-emerald-200/50 via-emerald-100/20 to-white/30 shadow-xl shadow-emerald-900/10 backdrop-blur-xl dark:border-emerald-200/15 dark:from-emerald-300/10 dark:via-emerald-400/[0.04] dark:to-white/[0.02] dark:shadow-emerald-950/30"
              />

              {/* Project glass chip */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-8 flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/70 px-3 py-2 text-xs font-medium text-emerald-900 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-emerald-100/10 dark:bg-[#14251c]/75 dark:text-emerald-100"
              >
                <FolderKanban
                  size={15}
                  className="text-emerald-600 dark:text-emerald-300"
                />
                Projects
              </motion.div>

              {/* Task glass chip */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="absolute bottom-7 right-0 flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/70 px-3 py-2 text-xs font-medium text-emerald-900 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-emerald-100/10 dark:bg-[#14251c]/75 dark:text-emerald-100"
              >
                <ListTodo
                  size={15}
                  className="text-emerald-600 dark:text-emerald-300"
                />
                Tasks
              </motion.div>

              {/* Folder illustration */}
              <motion.svg
                viewBox="0 0 180 150"
                role="img"
                aria-label="An empty workspace folder"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl"
              >
                <defs>
                  <linearGradient
                    id="empty-folder-green"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                <path
                  d="M28 42a10 10 0 0 1 10-10h39l14 14h51a10 10 0 0 1 10 10v57a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10V42Z"
                  fill="url(#empty-folder-green)"
                  fillOpacity=".78"
                  stroke="#34d399"
                  strokeOpacity=".75"
                  strokeWidth="2"
                />
                <path
                  d="M29 61h122l-9 47a10 10 0 0 1-10 8H40a10 10 0 0 1-10-10l-1-45Z"
                  fill="#10b981"
                  fillOpacity=".55"
                  stroke="#6ee7b7"
                  strokeOpacity=".8"
                  strokeWidth="2"
                />
                <path
                  d="M68 84h44"
                  stroke="white"
                  strokeOpacity=".75"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </motion.svg>

              <motion.span
                animate={{ rotate: [0, 8, -5, 0], y: [0, -3, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-12 top-2 grid h-9 w-9 place-items-center rounded-xl border border-emerald-200/70 bg-white/70 text-emerald-600 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-emerald-100/10 dark:bg-[#14251c]/75 dark:text-emerald-200"
              >
                <Sparkles size={16} />
              </motion.span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Your workspace is ready to begin
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create a workspace to bring projects, tasks, and activity together
              in one place.
            </p>

            <button
              type="button"
              onClick={() => setShow(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-300 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 hover:dark:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-[#0b0b0d]"
            >
              <Plus size={16} />
              Create workspace
            </button>
          </motion.section>
        </main>
      </MotionConfig>
      <NewWsModal show={show} setShow={setShow} />
    </>
  );
}
