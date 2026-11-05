export function CircularProgress({
  progress,
  size,
  stroke,
  svgSize,
  cancelDownload,
}: {
  progress: number;
  size: number;
  stroke: number;
  svgSize?: string;
  cancelDownload: () => void;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255,255,255,0.3)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-150"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center "
        onClick={() => cancelDownload()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`cursor-pointer ${svgSize ?? "size-6"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  );
}
