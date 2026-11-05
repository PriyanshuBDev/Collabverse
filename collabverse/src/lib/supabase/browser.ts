import { createBrowserClient } from "@supabase/ssr";

function getEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const supabaseBrowser = () => {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
