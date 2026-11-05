export function UpDownArrowSvg({
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
      className={size ?? "size-4 lg:size-5"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 15l3.75 3.75L15.75 15M15.75 9l-3.75-3.75L8.25 9"
      />
    </svg>
  );
}
