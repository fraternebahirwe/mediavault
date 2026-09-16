import { useNavigate } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { FileItem } from "../../types";
import { getFileIcon } from "../../utils/fileIcons";
import { formatBytes, formatRelativeTime } from "../../utils/formatBytes";
import { EmptyState } from "../ui/EmptyState";

export function RecentFiles({ files }: { files: FileItem[] }) {
  const navigate = useNavigate();

  if (files.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={Clock3}
          title="No files yet"
          description="Files you upload will show up here."
        />
      </div>
    );
  }

  return (
    <div className="card divide-y divide-gray-100 dark:divide-gray-800 p-1">
      {files.map((file) => {
        const Icon = getFileIcon(file.fileType, file.mimeType);
        return (
          <button
            key={file.id}
            onClick={() => navigate(`/files/all?search=${encodeURIComponent(file.fileName)}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
              {file.thumbnailUrl ? (
                <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Icon size={18} className="text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{file.fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(file.fileSize)} &middot; {formatRelativeTime(file.createdAt)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
