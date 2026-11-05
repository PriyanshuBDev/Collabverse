import useIsDark from "@/lib/hooks/useIsDark";

export function AddUserSvgLight({
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
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
      />
    </svg>
  );
}

export function AddUserSvgDark({
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
      className={size ?? "size-6"}
    >
      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
    </svg>
  );
}

export function AddUserSvg({
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
    <AddUserSvgDark size={size} fill={fill} />
  ) : (
    <AddUserSvgLight size={size} stroke={stroke} strokeWidth={strokeWidth} />
  );
}
