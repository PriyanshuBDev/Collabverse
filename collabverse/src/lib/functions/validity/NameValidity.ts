export default function isValidRealName(value: string, strict: boolean) {
  if (!strict) {
    if (value === "") return true;
    if (value.length > 25) return false;
    if (/\s{2,}/.test(value)) return false;
    return /^[\p{L}][\p{L}\s.'-]*$/u.test(value);
  }

  const name = value.trim();
  if (!name) return false;
  if (name.length > 25) return false;
  if (/\s{2,}/.test(name)) return false;
  return /^[\p{L}]+([ '-.][\p{L}]+)*$/u.test(name);
}
