import AppAndSide from "@/components/helpers/AppAndSide";
import { ShowUserCard } from "@/components/users/ShowUserCard";

import { Suspense } from "react";

export default async function WithSidebar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppAndSide />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main
          className="flex flex-1 flex-col h-full overflow-auto transition-all duration-300 dark:bg-blk2 bg-gray-50 ease-in-out ml-0 mt-0 dark:text-white text-gray-900"
          id="dashboard-main"
          data-mounted="false"
        >
          <Suspense fallback={null}>
            {children} <ShowUserCard />
          </Suspense>
        </main>
      </div>
    </>
  );
}
