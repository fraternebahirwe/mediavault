interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export function CircularProgress({
  percent,
  size = 140,
  strokeWidth = 12,
  label,
  subLabel,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped > 90 ? "#ef4444" : clamped > 70 ? "#f59e0b" : "#4f5eff";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-800"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-semibold">{label ?? `${Math.round(clamped)}%`}</span>
        {subLabel && <span className="text-xs text-gray-500 dark:text-gray-400">{subLabel}</span>}
      </div>
    </div>
  );
}
