import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  colorClass: string;
}

export function StatsCard({ icon: Icon, label, value, colorClass }: StatsCardProps) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-tight">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </div>
  );
}
