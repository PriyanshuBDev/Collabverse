import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const getCurrentUserServer = async () => {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
};
