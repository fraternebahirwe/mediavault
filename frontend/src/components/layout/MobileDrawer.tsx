import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Vault, X } from "lucide-react";
import { navItems } from "./navItems";

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Vault size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg">MediaVault</span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-full" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
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
      </div>
    </div>,
    document.body
  );
}
