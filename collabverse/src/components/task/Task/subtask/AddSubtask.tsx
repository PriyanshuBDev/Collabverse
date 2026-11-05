import NameValidityCard from "@/components/btns/workspace/NameValidityCard";
import Spinner2 from "@/components/loadings/Spinner2";
import TitleAndElement from "@/components/myTasks/TitleAndElement";
import { SubtaskSvg, SubtaskSvgDark } from "@/components/svg/SubtaskSvg";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import { useCreateSubtask } from "@/lib/queries/workspace/project/task/subtask/useCreateSubtask";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

export default function AddSubtask({
  active,
  setActive,
}: {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate, isPending } = useCreateSubtask();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  if (isPending) {
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <SubtaskSvg size="size-5 lg:size-7" />
        </Spinner2>
      </OverlayWrapper>
    );
  }
  const close = () => {
    setActive(false);
    setName("");
    setDescription("");
  };
  const disabled = !name || name.length < 6;
  return (
    <OverlayWrapper active={active}>
      <div className="max-w-sm lg:max-w-lg min-w-xs lg:min-w-md">
        <div className="text-gray-900 dark:text-gray-100 mb-1 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
          <SubtaskSvgDark size="size-5 lg:size-7" /> Create Subtask
        </div>
        <TitleAndElement title="Name">
          <NameValidityCard name={name} setName={setName} />
        </TitleAndElement>

        <TitleAndElement title="Description" addons="mt-2">
          <textarea
            maxLength={1000}
            value={description}
            placeholder="Enter new task description"
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setDescription(e.target.value);
              const target = e.target;
              target.style.height = "auto"; // reset height
              target.style.height = target.scrollHeight + "px";
            }}
            className="thinScrollbar resize-none overflow-hidden max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-400 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
          />
        </TitleAndElement>
        <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
          <button
            className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
            onClick={close}
          >
            cancel
          </button>
          <button
            disabled={disabled}
            className={`px-2 lg:px-3 py-1 lg:py-1 cursor-not-allowed rounded-md text-sm lg:text-base font-semibold ${
              disabled
                ? "cursor-not-allowed bg-gray-300 dark:bg-blk6"
                : "bg-blue-500 hover:bg-blue-400 cursor-pointer text-white"
            }`}
            onClick={() => {
              mutate({ name, description });
              close();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </OverlayWrapper>
  );
}
