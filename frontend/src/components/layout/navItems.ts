import {
  Clock,
  FileText,
  FolderOpen,
  Image,
  LayoutDashboard,
  Star,
  Trash2,
  Video,
} from "lucide-react";

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/files/all", label: "All Files", icon: FolderOpen },
  { to: "/files/photos", label: "Photos", icon: Image },
  { to: "/files/videos", label: "Videos", icon: Video },
  { to: "/files/documents", label: "Documents", icon: FileText },
  { to: "/files/favorites", label: "Favorites", icon: Star },
  { to: "/files/recent", label: "Recently Added", icon: Clock },
  { to: "/files/trash", label: "Trash", icon: Trash2 },
];

export const mobileNavItems = [
  navItems[0],
  navItems[1],
  navItems[4],
  navItems[7],
];
