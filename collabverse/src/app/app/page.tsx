import MainArea from "@/components/App/MainArea";
import MainAppbar from "@/components/Appbar/MainAppbar";
import NewWsBtn from "@/components/btns/workspace/NewWsBtn";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

export default function Profile() {
  return (
    <div className="flex relative h-screen bg-gray-50 dark:bg-blk2 w-full dark:text-white text-gray-900">
      <MainAppbar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex flex-1 flex-col h-full overflow-auto transition-all duration-300 dark:bg-blk2 bg-gray-50 ease-in-out mt-15 p-5 ">
          <FlexBtwWrapper>
            <div className="flex gap-1 flex-col">
              <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                Workspaces
              </div>
              <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
                All Your Workspaces, Organized and Ready
              </div>
            </div>
            <NewWsBtn />
          </FlexBtwWrapper>
          <MainArea />
        </main>
      </div>
    </div>
  );
}
