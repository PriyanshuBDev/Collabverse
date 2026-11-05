export function getMediaCategory(
  type: string | undefined,
  format: string | undefined
) {
  if (!type || !format) return "unknown";

  // VIDEO / AUDIO
  if (type === "video") {
    return "video";
  }

  if (type === "audio") {
    return "audio";
  }

  // PHOTO / IMAGE
  if (
    type === "image" ||
    ["jpg", "jpeg", "png", "webp", "avif", "heic"].includes(format)
  ) {
    return "photo";
  }

  // DOCUMENTS
  if (
    type === "application" ||
    type === "raw" ||
    ["pdf", "doc", "docx", "txt", "pptx", "xlsx", "csv", "zip"].includes(format)
  ) {
    return format;
  }

  return "unknown";
}
