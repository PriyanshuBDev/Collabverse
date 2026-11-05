"use client";

import useIsDark from "@/lib/hooks/useIsDark";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export interface PCDataProps {
  date: string;
  planned: number;
  actual: number;
}

interface PCProps {
  data: PCDataProps[];
}
export default function ProductivityChart({ data }: PCProps) {
  const isDark = useIsDark();
  const colors: Record<string, string> = {
    planned: "#60a5fa",
    actual: "#34d399",
  };
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          {" "}
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="5 5"
            vertical={false}
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "gray", fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
            minTickGap={25}
          />
          <YAxis tick={{ fill: "gray" }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({
              active,
              payload,
            }: {
              active: boolean;
              payload: { payload: PCDataProps }[];
            }) => {
              if (!active || !payload?.length) return null;

              const item = payload[0]?.payload;
              return (
                <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl px-4 py-2 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.date}
                  </div>
                  <div className="text-lg " style={{ color: "#34d399" }}>
                    Actual {item.actual}
                  </div>
                  <div className="text-lg" style={{ color: "#60a5fa" }}>
                    Planned {item.planned}
                  </div>
                </div>
              );
            }}
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#fff",
              color: isDark ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              boxShadow: isDark
                ? "0 2px 6px rgba(0,0,0,0.4)"
                : "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />
          <Legend></Legend>
          <Area
            type="monotone"
            dataKey="actual"
            stroke="none"
            fill="url(#actualGrad)"
            fillOpacity={0.2}
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="planned"
            stroke={colors.planned}
            strokeDasharray="3 3"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={colors.actual}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
