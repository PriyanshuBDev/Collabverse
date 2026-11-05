"use client";

import { motion, MotionConfig } from "framer-motion";

export default function EmptyTasks() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="flex  items-center justify-center px-6 py-16 text-slate-900 dark:text-slate-100">
        <motion.section
          aria-labelledby="empty-tasks-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-7 grid h-48 w-56 place-items-center"
          >
            <div className="absolute inset-x-6 inset-y-5 rounded-[2.5rem] bg-emerald-400/10 blur-2xl dark:bg-emerald-400/[0.08]" />

            <svg
              viewBox="0 0 240 180"
              role="img"
              aria-label="An empty task list"
              className="relative w-52 drop-shadow-xl"
            >
              <defs>
                <linearGradient id="taskCard" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="taskPaper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ecfdf5" />
                </linearGradient>
              </defs>

              <ellipse
                cx="120"
                cy="151"
                rx="66"
                ry="9"
                fill="#10b981"
                fillOpacity=".12"
              />

              <motion.g
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <rect
                  x="68"
                  y="27"
                  width="104"
                  height="126"
                  rx="13"
                  fill="url(#taskPaper)"
                  stroke="#a7f3d0"
                  strokeWidth="2"
                />
                <path
                  d="M91 51h58"
                  stroke="#64756b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <rect
                  x="88"
                  y="69"
                  width="14"
                  height="14"
                  rx="4"
                  fill="#d1fae5"
                />
                <path
                  d="m91 76 3 3 6-7"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M111 76h37"
                  stroke="#a7b8ad"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <rect
                  x="88"
                  y="94"
                  width="14"
                  height="14"
                  rx="4"
                  fill="#d1fae5"
                />
                <path
                  d="m91 101 3 3 6-7"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M111 101h30"
                  stroke="#a7b8ad"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <rect
                  x="88"
                  y="119"
                  width="14"
                  height="14"
                  rx="4"
                  fill="#f0fdf4"
                  stroke="#a7f3d0"
                />
                <path
                  d="M111 126h25"
                  stroke="#c2cec6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </motion.g>

              <motion.g
                animate={{ rotate: [0, 3, -2, 0], y: [0, -2, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <rect
                  x="147"
                  y="105"
                  width="43"
                  height="39"
                  rx="11"
                  fill="url(#taskCard)"
                  fillOpacity=".9"
                  stroke="#6ee7b7"
                  strokeWidth="2"
                />
                <path
                  d="m159 124 6 6 13-14"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            </svg>
          </motion.div>

          <h1
            id="empty-tasks-title"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            No tasks found
          </h1>
        </motion.section>
      </main>
    </MotionConfig>
  );
}
