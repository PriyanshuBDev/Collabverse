import MainArea from "@/components/Profile/MainArea";

export default function Profile() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5">
      <div className="flex gap-1 flex-col">
        <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
          My Profile
        </div>
        <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
          Profile settings & information.
        </div>
      </div>
      <MainArea />
    </div>
  );
}
