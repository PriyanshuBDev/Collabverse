import { WorkspacesProps } from "@/app/interfaces";
import WsCard2 from "./Card";

export default function WorkspaceCards({
  gridCols,
  data,
}: {
  gridCols?: string;
  data: WorkspacesProps[];
}) {
  if (data.length < 1) {
    return (
      <div className="w-full h-[40vh] flex items-center justify-center text-gray-600 dark:text-gray-400 text-base lg:text-2xl">
        No workspace found
      </div>
    );
  }
  return (
    <div
      className={`grid ${gridCols ?? "2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2"} xl:gap-5 gap-3`}
    >
      {data.map((ws: WorkspacesProps) => (
        <div key={ws.id} className="col-span-1">
          <WsCard2 ws={ws}></WsCard2>
        </div>
      ))}
    </div>
  );
}
