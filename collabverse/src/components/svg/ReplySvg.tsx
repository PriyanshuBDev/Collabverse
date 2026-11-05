import useIsDark from "@/lib/hooks/useIsDark";

export function ReplySvgLight({
  size,
  stroke,
  strokeWidth,
}: {
  size?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={stroke ?? "currentColor"}
      strokeWidth={strokeWidth ?? 1.7}
      className={size ?? "w-4 h-4 lg:w-5 lg:h-5"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"
      />
    </svg>
  );
}

export function ReplySvgDark({ size, fill }: { size?: string; fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill ?? "currentColor"}
      className={size ?? "w-4 h-4 lg:w-5 lg:h-5"}
    >
      <path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
    </svg>
  );
}

export function ReplySvg({
  size,
  stroke,
  strokeWidth,
  fill,
}: {
  size?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}) {
  const isDark = useIsDark();

  return isDark ? (
    <ReplySvgDark size={size} fill={fill} />
  ) : (
    <ReplySvgLight size={size} stroke={stroke} strokeWidth={strokeWidth} />
  );
}
