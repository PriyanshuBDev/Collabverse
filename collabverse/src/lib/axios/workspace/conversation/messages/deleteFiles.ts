import { supabaseBrowser } from "@/lib/supabase/browser";

export async function deleteFiles(paths: string[]) {
  const supabase = supabaseBrowser();
  const { error } = await supabase.storage.from("Chat_Media").remove(paths);
  if (error) throw error;
}
