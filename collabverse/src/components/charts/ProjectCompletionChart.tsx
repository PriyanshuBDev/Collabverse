"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
type prop = {
  name: string;
  value: number;
};
export default function ProjectCompletionChart({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const data = [
    {
      name: "Done",
      value,
    },
    {
      name: "Remaining",
      value: total - value,
    },
  ];

  const Colors = ["url(#doneGradient)", "#e5e7eb"];

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="doneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="innerShadow">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#000"
                floodOpacity="0.12"
              />
            </filter>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="95%"
            stroke="none"
            animationDuration={1200}
            animationEasing="ease-out"
            filter="url(#innerShadow"
          >
            {data.map((_: prop, idx: number) => (
              <Cell key={idx} fill={Colors[idx]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {total > 0 ? ((value / total) * 100).toFixed(0) : 0}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {value} / {total} Projects
        </div>
      </div>
    </div>
  );
}
