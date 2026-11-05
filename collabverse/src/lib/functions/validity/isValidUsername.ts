export function isValidUsername(value: string, strict: boolean) {
  if (value === "") return true;
  if (value.length > 20) return false;

  if (strict === false) {
    return /^@?[a-z0-9._]*$/.test(value);
  } else {
    if (!/^@[a-z0-9]+(?:[._][a-z0-9]+)*$/.test(value)) return false;

    return true;
  }
}
