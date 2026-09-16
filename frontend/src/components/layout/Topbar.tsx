import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Moon, Search, Sun, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { MobileDrawer } from "./MobileDrawer";

export function Topbar({ onUploadClick }: { onUploadClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/files/all${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <button
        className="md:hidden btn-ghost p-2 rounded-lg"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, tags, folders..."
            className="input pl-9"
          />
        </div>
      </form>

      <button onClick={onUploadClick} className="btn-primary hidden sm:inline-flex">
        <Upload size={16} />
        Upload
      </button>

      <button onClick={toggleTheme} className="btn-ghost p-2 rounded-lg" aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <Dropdown
        trigger={
          <button className="w-9 h-9 rounded-full bg-brand-600 text-white text-sm font-medium flex items-center justify-center">
            {initials || "?"}
          </button>
        }
      >
        {(close) => (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
            <DropdownItem
              danger
              onClick={() => {
                close();
                logout();
              }}
            >
              Log out
            </DropdownItem>
          </>
        )}
      </Dropdown>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
