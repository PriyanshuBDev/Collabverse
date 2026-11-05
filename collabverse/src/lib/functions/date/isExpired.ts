export function isExpired(dateString: string): boolean {
  return new Date(dateString).getTime() < Date.now();
}
