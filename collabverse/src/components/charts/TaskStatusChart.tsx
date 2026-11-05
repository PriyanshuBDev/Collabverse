"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { taskStatusCardProps } from "../overview/TaskStatusCard";

interface TaskStatusProps {
  data: taskStatusCardProps[];
}

export default function TaskStatusChart({ data }: TaskStatusProps) {
  const colors: Record<string, string> = {
    "To Do": "#60a5fa",
    "In Progress": "#fbbf24",
    "In Review": "#7c3aed",
    Done: "#34d399",
    Overdue: "#ef4444",
  };

  return (
    <div className="w-full h-full flex ">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          {" "}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const item = payload[0]?.payload;

              return (
                <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl px-4 py-2 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.status}
                  </div>
                  <div
                    className="text-lg font-bold "
                    style={{ color: colors[item.status] }}
                  >
                    {item.value} Tasks
                  </div>
                </div>
              );
            }}
          />
          <defs>
            <linearGradient id="todoGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            <linearGradient id="reviewGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>

            <linearGradient id="doneGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <Bar dataKey={"value"} fill="#8884d8" radius={[0, 15, 15, 0]}>
            {data.map((entry: taskStatusCardProps) => {
              let gradientId = "";

              if (entry.status === "To Do") gradientId = "todoGradient";
              if (entry.status === "In Progress")
                gradientId = "progressGradient";
              if (entry.status === "In Review") gradientId = "reviewGradient";
              if (entry.status === "Done") gradientId = "doneGradient";
              return <Cell key={entry.status} fill={`url(#${gradientId})`} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
