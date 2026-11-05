import NewProjectBtn from "@/components/btns/project/NewProjectBtn";
import MainPsArea from "@/components/projects/MainPsArea";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

export default function Projects() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5">
      <FlexBtwWrapper>
        <div className="flex gap-1 flex-col">
          <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            Projects
          </div>
          <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
            Projects that are Engineered for Success
          </div>
        </div>
        <NewProjectBtn />
      </FlexBtwWrapper>
      <MainPsArea />
    </div>
  );
}
