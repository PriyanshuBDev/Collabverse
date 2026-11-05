import crypto from "crypto";

export function generateSlug(name: string) {
  const base = normalizeName(name);
  const suffix = uuidSuffix();
  return `${base}-${suffix}`;
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
function uuidSuffix() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 4);
}
