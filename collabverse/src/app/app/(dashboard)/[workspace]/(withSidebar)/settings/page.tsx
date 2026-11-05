import Settings from "@/components/Settings/Settings";

export default function Setting() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5">
      <div className="flex gap-1 flex-col">
        <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
          Settings
        </div>
        <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
          Configure your project and workspace
        </div>
      </div>
      <Settings></Settings>
    </div>
  );
}
