import { withAuth } from "@/lib/api/auth/withAuth";
import { User } from "@supabase/supabase-js";

export const POST = withAuth(async(user:User)=>{
  user.
})