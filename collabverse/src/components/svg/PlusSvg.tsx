export function PlusSvg({
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
      className={size ?? "size-3 lg:size-4"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}
