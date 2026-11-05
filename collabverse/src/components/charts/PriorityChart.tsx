"use client";

import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
export interface priortiyDataProps {
  priority: string;
  value: number;
}
interface PriorityChartDataProps {
  data: {
    priority: string;
    value: number;
  }[];
}
type entryProp = {
  priority: string;
  value: number;
};
export default function PriorityChart({ data }: PriorityChartDataProps) {
  const colors: Record<string, string> = {
    Low: "#34d399",
    Medium: "#fbbf24",
    High: "#f97316",
    Critical: "#ef4444",
  };
  const COLORS = [
    "url(#lowGrad)",
    "url(#mediumGrad)",
    "url(#highGrad)",
    "url(#criticalGrad)",
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }: PieLabelRenderProps) => {
    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof outerRadius !== "number" ||
      typeof percent !== "number" ||
      typeof index !== "number"
    )
      return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const priority = data[index]?.priority;
    const color = priority ? colors[priority] : "#9ca3af";

    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {data[index]?.priority ?? "Unknown"} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-2">
      <div className="relative w-full h-full flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              <linearGradient id="mediumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>

              <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>

              <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="priority"
              startAngle={90}
              endAngle={-270}
              innerRadius="35%"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={2}
              animationDuration={1000}
              animationEasing="ease-out"
              label={renderLabel}
            >
              {data.map((entry: entryProp, index: number) => {
                return (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                );
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {total}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Tasks
          </div>
        </div>
      </div>
    </div>
  );
}
