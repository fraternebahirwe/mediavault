import clsx from "clsx";

interface ProgressBarProps {
  percent: number;
  colorClass?: string;
  className?: string;
}

export function ProgressBar({ percent, colorClass = "bg-brand-600", className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={clsx("w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-300", colorClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
