import MainAppbar from "@/components/Appbar/MainAppbar";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex relative h-screen bg-gray-50 dark:bg-blk2 w-full dark:text-white text-gray-900">
      <MainAppbar />
      <div className="flex flex-1 flex-col min-h-0 overflow-auto transition-all duration-300 dark:bg-blk2 bg-gray-50 ease-in-out ml-0 mt-15 p-5 ">
        {children}
      </div>
    </div>
  );
}
