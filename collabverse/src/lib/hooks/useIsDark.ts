import { useTheme } from "next-themes";
import useMounted from "./useMounted";

export default function useIsDark() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  if (!mounted) return false;
  const isDark = resolvedTheme === "dark";
  return isDark;
}
