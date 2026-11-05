"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await supabaseBrowser().auth.signOut();

    queryClient.clear();

    router.replace("/auth/signin");
  };
}
