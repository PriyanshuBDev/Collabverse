import { fileMetadata } from "@/app/interfaces";
import { supabaseBrowser } from "@/lib/supabase/browser";

export async function deleteAttachments(files: fileMetadata[]) {
  const paths: string[] = files.map((f: fileMetadata) => f.path);
  const supabase = supabaseBrowser();
  const { error } = await supabase.storage.from("Attachments").remove(paths);
  if (error) throw error;
}
