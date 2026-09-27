import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { mobileNavItems } from "./navItems";

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around py-2">
      {mobileNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-xs rounded-lg transition duration-200 ease-out hover:-translate-y-0.5 active:scale-95",
              isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
