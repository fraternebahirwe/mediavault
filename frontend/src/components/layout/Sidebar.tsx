import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Vault } from "lucide-react";
import { navItems } from "./navItems";
import { useDashboard } from "../../hooks/useDashboard";
import { ProgressBar } from "../ui/ProgressBar";
import { formatBytes } from "../../utils/formatBytes";

export function Sidebar() {
  const { data: stats } = useDashboard();

  const used = stats ? Number(stats.storageUsed) : 0;
  const limit = stats ? Number(stats.storageLimit) : 1;
  const percent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Vault size={18} className="text-white" />
        </div>
        <span className="font-semibold text-lg">MediaVault</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="card p-3 mt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Storage</p>
        <ProgressBar percent={percent} colorClass={percent > 90 ? "bg-red-500" : "bg-brand-600"} />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {formatBytes(used)} / {formatBytes(limit)} used
        </p>
      </div>
    </aside>
  );
}
