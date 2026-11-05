"use server";

import { prisma } from "@/lib/db/prisma";
import { supabaseServer } from "@/lib/supabase/server";

export default async function getProfileCompleted() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { profileCompleted: true },
  });
  return { profileCompleted: currentUser?.profileCompleted ?? false, user };
}
