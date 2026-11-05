import { createClient } from "@supabase/supabase-js";

function getEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseService) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return { supabaseUrl, supabaseService };
}

export const supabaseAdmin = () => {
  const { supabaseUrl, supabaseService } = getEnvironmentVariables();
  return createClient(supabaseUrl, supabaseService, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
