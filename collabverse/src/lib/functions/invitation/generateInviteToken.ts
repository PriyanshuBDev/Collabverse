export function generateInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const base64 = btoa(String.fromCharCode(...bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
