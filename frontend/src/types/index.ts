export type FileType = "PHOTO" | "VIDEO" | "DOCUMENT";
export type SharePermission = "VIEW" | "DOWNLOAD";

export interface User {
  id: string;
  email: string;
  name: string;
  storageLimit: string;
  storageUsed?: string;
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface FileItem {
  id: string;
  userId: string;
  folderId: string | null;
  fileName: string;
  fileType: FileType;
  mimeType: string;
  fileSize: string;
  storageUrl: string;
  thumbnailUrl: string | null;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalFiles: number;
  photos: number;
  videos: number;
  documents: number;
  favorites: number;
  storageUsed: string;
  storageLimit: string;
  recentFiles: FileItem[];
}

export interface SharedLink {
  id: string;
  token: string;
  fileId: string;
  permission: SharePermission;
  isPublic: boolean;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  shareUrl: string;
}

export type FileCategory =
  | "all"
  | "photos"
  | "videos"
  | "documents"
  | "favorites"
  | "recent"
  | "trash";

export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";
export type ViewMode = "grid" | "list";
