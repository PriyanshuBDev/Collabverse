import { subTaskProps } from "@/app/interfaces";
import { SubtaskSvg } from "@/components/svg/SubtaskSvg";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { useState } from "react";
import AddSubtask from "./AddSubtask";
import Toolbar from "@/components/helpers/Toolbar";
import SubTaskCard from "./SubTaskCard";
import { PlusSvg } from "@/components/svg/PlusSvg";

export default function SubtaskArea({
  subtasks,
  canEdit,
}: {
  subtasks: subTaskProps[];
  canEdit: boolean;
}) {
  const [showSubTask, setShowSubTask] = useState<string[]>([]);
  const [subTaskAddOverlay, setSubTaskAddOverlay] = useState(false);
  const doneSubtasks = subtasks.reduce(
    (acc: number, cur: subTaskProps) => acc + (cur.done ? 1 : 0),
    0,
  );
  return (
    <div className="px-3">
      <FlexBtwWrapper addOns=" mt-5 mb-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base ">
          <SubtaskSvg />
          Subtasks
          <div className="px-2 py-0.5 bg-gray-100 dark:bg-blk4 text-xs rounded-md border border-gray-400 dark:border-gray-600">
            {doneSubtasks} / {subtasks.length}
          </div>
        </div>
        {subtasks.length < 10 && (
          <div
            className={`relative group flex items-center gap-1 cursor-pointer text-xs px-2 py-0.5 bg-gray-100 dark:bg-blk4 hover:bg-gray-300 dark:hover:bg-blk6 focus:outline-none w-fit font-medium rounded-md border border-gray-400 dark:border-gray-600 text-gray-500 `}
            onClick={() => {
              setSubTaskAddOverlay(true);
            }}
          >
            <PlusSvg></PlusSvg>
            Add
            <Toolbar top="-top-7">Add Subtasks</Toolbar>
          </div>
        )}
      </FlexBtwWrapper>
      <AddSubtask active={subTaskAddOverlay} setActive={setSubTaskAddOverlay} />
      {subtasks.length > 0 && (
        <div className="mx-2 flex flex-col gap-2">
          {subtasks.map((s: subTaskProps, idx: number) => (
            <SubTaskCard
              canEdit={canEdit}
              setShowSubTask={setShowSubTask}
              showSubTask={showSubTask}
              subtask={s}
              key={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
