import { supabaseBrowser } from "@/lib/supabase/browser";

export default async function uploadAttachment(taskId: string, file: File) {
  const supabase = supabaseBrowser();
  const uuid = crypto.randomUUID();
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuid}.${fileExt}`;
  const path = `Attachments/${fileName}`;

  const { error } = await supabase.storage
    .from("Attachments")
    .upload(path, file);

  if (error) throw error;
  return { path, originalName: file.name, fileName };
}
