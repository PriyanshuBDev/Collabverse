export function DataFormatter(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = bytes / Math.pow(k, i);
  const decimals = i < 2 ? 0 : 2; // 0 for Bytes/KB, 2 for MB+
  return `${value.toFixed(decimals)} ${sizes[i]}`;
}
