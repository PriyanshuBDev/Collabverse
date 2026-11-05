import api from "@/lib/axios";
import uploadAttachment from "./uploadAttachment";

export default async function sendAttachments(
  taskId: string,
  files: File[],
  userId: string,
) {
  for (const file of files) {
    const tempId = crypto.randomUUID();
    const [type, format] = file.type.split("/");
    // addAttachmentToUI({
    //  id:tempId
    //  name: file.name
    //  type,
    //  format,
    //  size,
    //  attachedAt: new Date(),
    //  attachedById:userId,
    //  status:"uploading"
    // })

    try {
      const upload = await uploadAttachment(taskId, file);

      const res = await api.post("/api/task/attachment/upload", {
        originalName: upload.originalName,
        fileName: upload.fileName,
        path: upload.path,
        type,
        format,
        size: file.size,
        taskId,
        attachedById: userId,
      });

      // updateAttachmentToUI({
      //  id: res.id
      //  status:"sent"
      // })
    } catch (e) {
      // updateAttachmentToUI({
      //  status:"failed"
      // })
      throw e;
    }
  }
}
