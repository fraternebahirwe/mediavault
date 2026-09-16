import { Star } from "lucide-react";
import { FileItem } from "../../types";
import { formatBytes, formatDate } from "../../utils/formatBytes";
import { getFileIcon, getFileTypeLabel } from "../../utils/fileIcons";
import { FileMenu } from "./FileMenu";

interface FileListRowProps {
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

export function FileListRow(props: FileListRowProps) {
  const { file, onOpen } = props;
  const Icon = getFileIcon(file.fileType, file.mimeType);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <button
        onClick={onOpen}
        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0"
      >
        {file.thumbnailUrl ? (
          <img src={file.thumbnailUrl} alt={file.fileName} className="w-full h-full object-cover" />
        ) : (
          <Icon size={18} className="text-gray-400" />
        )}
      </button>

      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {file.fileName}
          {file.isFavorite && <Star size={13} className="fill-yellow-400 text-yellow-400 shrink-0" />}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {getFileTypeLabel(file.mimeType)}
        </p>
      </button>

      <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 w-20 text-right">
        {formatBytes(file.fileSize)}
      </span>
      <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 w-24 text-right">
        {formatDate(file.createdAt)}
      </span>

      <FileMenu {...props} />
    </div>
  );
}
