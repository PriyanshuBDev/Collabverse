import MainArea from "@/components/myTasks/MainArea";
import NewTaskBtn from "@/components/btns/task/NewTaskBtn";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

export default function MyTasks() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5">
      <FlexBtwWrapper>
        <div className="flex flex-col">
          <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl">
            My Tasks
          </div>
          <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base">
            Stay on track. Get things done
          </div>
        </div>
        <NewTaskBtn />
      </FlexBtwWrapper>
      <MainArea />
    </div>
  );
}
