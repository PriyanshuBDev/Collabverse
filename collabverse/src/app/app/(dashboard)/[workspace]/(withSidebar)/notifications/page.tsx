import MainArea from "@/components/notification/MainArea";
import NotiStateToggler from "@/components/Toggler/NotiStateToggler";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

export default function Profile() {
  return (
    <div className="dark:text-white w-full h-full flex flex-col text-gray-900 p-5">
      <FlexBtwWrapper>
        <div className="flex gap-1 flex-col">
          <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            Notifications
          </div>
          <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
            Stay informed about important updates.
          </div>
        </div>
        <NotiStateToggler></NotiStateToggler>
      </FlexBtwWrapper>
      <div className="flex-1 min-h-0 flex flex-col">
        <MainArea />
      </div>
    </div>
  );
}
