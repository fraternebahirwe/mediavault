import { Star } from "lucide-react";
import { FileItem } from "../../types";
import { formatBytes, formatDate } from "../../utils/formatBytes";
import { getFileIcon } from "../../utils/fileIcons";
import { FileMenu } from "./FileMenu";

interface FileCardProps {
  file: FileItem;
  onOpen: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  isTrash?: boolean;
}

export function FileCard(props: FileCardProps) {
  const { file, onOpen } = props;
  const Icon = getFileIcon(file.fileType, file.mimeType);

  return (
    <div className="card group overflow-hidden flex flex-col hover:shadow-soft transition-shadow">
      <button
        onClick={onOpen}
        className="relative aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
      >
        {file.thumbnailUrl || file.fileType === "PHOTO" ? (
          <img
            src={file.thumbnailUrl ?? file.storageUrl}
            alt={file.fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <Icon size={40} className="text-gray-400" />
        )}
        {file.isFavorite && (
          <Star size={16} className="absolute top-2 left-2 fill-yellow-400 text-yellow-400 drop-shadow" />
        )}
      </button>

      <div className="p-2.5 flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" title={file.fileName}>
            {file.fileName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(file.fileSize)} &middot; {formatDate(file.createdAt)}
          </p>
        </div>
        <FileMenu {...props} />
      </div>
    </div>
  );
}
