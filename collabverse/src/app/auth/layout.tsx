import React from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/app");
  }

  return <>{children}</>;
}
