import useIsDark from "@/lib/hooks/useIsDark";

export function PrioritySvgLight({
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
      strokeWidth={strokeWidth ?? 1.5}
      stroke={stroke ?? "currentColor"}
      className={size ?? "size-4 lg:size-5"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
      />
    </svg>
  );
}

export function PrioritySvgDark({
  size,
  fill,
}: {
  size?: string;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill ?? "currentColor"}
      className={size ?? "size-4 lg:size-5"}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
      />
    </svg>
  );
}

export function PrioritySvg({
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
    <PrioritySvgDark size={size} fill={fill} />
  ) : (
    <PrioritySvgLight size={size} stroke={stroke} strokeWidth={strokeWidth} />
  );
}
