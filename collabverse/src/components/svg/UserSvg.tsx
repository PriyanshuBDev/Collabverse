import useIsDark from "@/lib/hooks/useIsDark";

export function UserSvgLight({
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
      strokeWidth={strokeWidth ?? 1.5}
      className={size ?? "size-6"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

export function UserSvgDark({ size, fill }: { size?: string; fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill ?? "currentColor"}
      className={size ?? "size-6"}
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function UserSvg({
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
    <UserSvgDark size={size} fill={fill} />
  ) : (
    <UserSvgLight size={size} stroke={stroke} strokeWidth={strokeWidth} />
  );
}
