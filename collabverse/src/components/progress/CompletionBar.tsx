"use client";

export interface CBDataProps {
  status: string;
  value: number;
}
interface props {
  data: CBDataProps[];
}

export default function CompletionBar({ data }: props) {
  const colors: Record<string, string> = {
    "Not Started": "#e5e7eb", // gray-200
    "In Progress": "#fbbf24", // yellow-400
    Done: "#34d399", // green-400
  };
  const total = data.reduce(
    (acc: number, curr: CBDataProps) => acc + curr.value,
    0
  );

  return (
    <div className="items-center flex flex-col">
      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden flex ">
        {data.map((item: CBDataProps) => {
          const widthPercent = total ? (item.value / total) * 100 : 0;
          return (
            <div
              key={item.status}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: colors[item.status],
              }}
              className="h-full"
            />
          );
        })}
      </div>
      <div className="flex space-x-4 mt-3">
        {data.map((item: CBDataProps) => {
          const widthPercent = total ? (item.value / total) * 100 : 0;
          return (
            <div key={item.status} className="flex items-center space-x-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[item.status] }}
              />
              <span className="text-xs">
                {item.status}: {widthPercent.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
