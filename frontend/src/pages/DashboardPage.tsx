import { FileText, HardDrive, Image, Star, Video } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { StatsCard } from "../components/dashboard/StatsCard";
import { StorageWidget } from "../components/dashboard/StorageWidget";
import { RecentFiles } from "../components/dashboard/RecentFiles";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();
  const { user } = useAuth();

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-brand-600" size={28} />
      </div>
    );
  }

  const used = Number(stats.storageUsed);
  const limit = Number(stats.storageLimit);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening in your vault.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard icon={HardDrive} label="Total Files" value={stats.totalFiles} colorClass="bg-brand-600" />
        <StatsCard icon={Image} label="Photos" value={stats.photos} colorClass="bg-emerald-500" />
        <StatsCard icon={Video} label="Videos" value={stats.videos} colorClass="bg-rose-500" />
        <StatsCard icon={FileText} label="Documents" value={stats.documents} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StorageWidget used={used} limit={limit} />
        <div className="card p-5 flex items-center gap-3 lg:col-span-2">
          <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <p className="font-medium">{stats.favorites} favorite files</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Files you've starred for quick access.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-medium mb-3">Recently uploaded</h2>
        <RecentFiles files={stats.recentFiles} />
      </div>
    </div>
  );
}
