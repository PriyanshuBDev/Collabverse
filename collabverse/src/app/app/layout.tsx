import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import getProfileCompleted from "@/lib/api/auth/getProfileCompleted";
import UserProvider from "@/components/wrappers/UserProvider";
import GlobalLoading from "@/components/loadings/GlobalLoading";
import { NotificationProvider } from "@/components/wrappers/NotificationProvider";
import { NotificationToast } from "@/components/notification/NotificationToast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getProfileCompleted();
  if (!data) {
    redirect("/auth/signin");
  }

  if (!data.profileCompleted) {
    redirect("/onboarding");
  }
  return (
    <UserProvider user={data.user}>
      <Suspense fallback={<GlobalLoading />}>
        {" "}
        <NotificationProvider>
          {children} <NotificationToast />
        </NotificationProvider>{" "}
      </Suspense>
    </UserProvider>
  );
}
