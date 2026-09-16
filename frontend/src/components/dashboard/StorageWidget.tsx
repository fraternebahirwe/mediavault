import { CircularProgress } from "../ui/CircularProgress";
import { formatBytes } from "../../utils/formatBytes";

export function StorageWidget({ used, limit }: { used: number; limit: number }) {
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const remaining = Math.max(limit - used, 0);

  return (
    <div className="card p-5 flex items-center gap-5">
      <CircularProgress percent={percent} />
      <div>
        <p className="font-medium">Storage</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formatBytes(used)} of {formatBytes(limit)} used
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(remaining)} remaining</p>
      </div>
    </div>
  );
}
