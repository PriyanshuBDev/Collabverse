"use client";

import useIsDark from "@/lib/hooks/useIsDark";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TLCDataProps {
  id: string;
  name: string;
  "To Do": number;
  "In Progress": number;
  "In Review": number;
  Done: number;
}

interface TLCProps {
  data: TLCDataProps[];
}
interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: TLCDataProps;
}
export default function TeamLoadChart({ data }: TLCProps) {
  const formattedData = data.map((item: TLCDataProps) => ({
    ...item,
    total:
      item["To Do"] + item["In Progress"] + item["In Review"] + item["Done"],
  }));
  const isDark = useIsDark();
  const colors: Record<string, string> = {
    "To Do": "#60a5fa",
    "In Progress": "#fbbf24",
    "In Review": "#7c3aed",
    Done: "#34d399",
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-center gap-6 mb-2 lg:mb-4 flex-wrap">
        {Object.entries(colors).map(([key, color]: [string, string]) => (
          <div
            key={key}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span style={{ color }}>{key}</span>
          </div>
        ))}
      </div>
      <div className="w-full overflow-x-auto thinScrollbar">
        <div
          style={{ width: Math.max(data.length * 60, 540) }}
          className="lg:h-50 h-37"
        >
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.3)"
              />
              <XAxis
                dataKey={"name"}
                tick={{
                  fontSize: 8,
                  fontWeight: 500,
                }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis hide domain={[0, (dataMax: number) => dataMax + 2]} />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                content={({
                  active,
                  payload,
                }: {
                  active: boolean;
                  payload: TooltipPayloadItem[];
                }) => {
                  if (!active || !payload || !payload.length) return null;

                  return (
                    <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/20 shadow-xl px-2 lg:px-4 py-1.5 lg:py-3 rounded-xl min-w-[120px]">
                      {
                        <span className="font-semibold mb-1 lg:mb-2 text-gray-800 dark:text-gray-200 text-sm lg:text-base turncate">
                          {payload[0]?.payload.name}
                        </span>
                      }
                      {payload.map((item: TooltipPayloadItem) => (
                        <div
                          key={item.name}
                          className="flex justify-between gap-1 lg:gap-2 text-xs lg:text-base"
                        >
                          <span
                            style={{
                              color: colors[item.name],
                            }}
                          >
                            {item.name}
                          </span>

                          <span className="font-semibold  lg:mb-2 text-gray-800 dark:text-gray-200">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <defs>
                <filter id="softShadow" height="130%">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodColor="#000"
                    floodOpacity="0.12"
                  />
                </filter>
              </defs>
              <Bar
                dataKey={"To Do"}
                stackId="a"
                fill="#60a5fa"
                animationDuration={800}
                animationEasing="ease-out"
                filter="url(#softShadow)"
              />

              <Bar
                dataKey={"In Progress"}
                stackId="a"
                fill="#fbbf24"
                filter="url(#softShadow)"
              />
              <Bar
                dataKey={"In Review"}
                stackId="a"
                fill="#7c3aed"
                filter="url(#softShadow)"
              />
              <Bar
                dataKey={"Done"}
                stackId="a"
                fill="#34d399"
                radius={[6, 6, 0, 0]}
                filter="url(#softShadow)"
              >
                {" "}
                <LabelList
                  dataKey="total"
                  position="top"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: isDark ? "#fff" : "#111827",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>{" "}
      </div>
    </div>
  );
}
