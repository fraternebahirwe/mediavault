import { FileItem, ViewMode } from "../../types";
import { FileCard } from "./FileCard";
import { FileListRow } from "./FileListRow";

interface FileGridProps {
  files: FileItem[];
  viewMode: ViewMode;
  isTrash?: boolean;
  onOpen: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleFavorite: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRestore?: (file: FileItem) => void;
}

export function FileGrid({
  files,
  viewMode,
  isTrash,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onToggleFavorite,
  onShare,
  onDelete,
  onRestore,
}: FileGridProps) {
  const commonProps = (file: FileItem) => ({
    file,
    isTrash,
    onOpen: () => onOpen(file),
    onDownload: () => onDownload(file),
    onRename: () => onRename(file),
    onMove: () => onMove(file),
    onToggleFavorite: () => onToggleFavorite(file),
    onShare: () => onShare(file),
    onDelete: () => onDelete(file),
    onRestore: onRestore ? () => onRestore(file) : undefined,
  });

  if (viewMode === "list") {
    return (
      <div className="card divide-y divide-gray-100 dark:divide-gray-800 p-1">
        {files.map((file) => (
          <FileListRow key={file.id} {...commonProps(file)} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {files.map((file) => (
        <FileCard key={file.id} {...commonProps(file)} />
      ))}
    </div>
  );
}
