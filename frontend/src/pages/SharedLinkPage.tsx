import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Download, Vault } from "lucide-react";
import { getPublicShareRequest } from "../api/share.api";
import { API_BASE_URL } from "../api/client";
import { getFileIcon, getFileTypeLabel } from "../utils/fileIcons";
import { formatBytes, formatDate } from "../utils/formatBytes";
import { Spinner } from "../components/ui/Spinner";

export function SharedLinkPage() {
  const { token = "" } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-share", token],
    queryFn: () => getPublicShareRequest(token),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-brand-600" size={28} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-center px-4">
        <Vault size={32} className="text-gray-400" />
        <h1 className="text-lg font-semibold">Link unavailable</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This share link is invalid, disabled, or has expired.
        </p>
      </div>
    );
  }

  const { file, permission } = data;
  const Icon = getFileIcon(file.fileType, file.mimeType);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-6 max-w-lg w-full">
        <div className="flex items-center gap-2 mb-5">
          <Vault size={20} className="text-brand-600" />
          <span className="font-semibold">MediaVault</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Shared file</span>
        </div>

        <div className="rounded-xl2 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4" style={{ minHeight: 220 }}>
          {file.fileType === "PHOTO" ? (
            <img src={file.storageUrl} alt={file.fileName} className="max-h-80 object-contain" />
          ) : file.fileType === "VIDEO" ? (
            <video src={file.storageUrl} controls className="max-h-80 w-full" />
          ) : file.mimeType === "application/pdf" ? (
            <iframe src={file.storageUrl} title={file.fileName} className="w-full h-80 bg-white" />
          ) : (
            <Icon size={48} className="text-gray-400" />
          )}
        </div>

        <p className="font-medium truncate">{file.fileName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getFileTypeLabel(file.mimeType)} &middot; {formatBytes(file.fileSize)} &middot; {formatDate(file.createdAt)}
        </p>

        {permission === "DOWNLOAD" && (
          <a
            href={`${API_BASE_URL}/public/${token}/download`}
            className="btn-primary w-full mt-4"
          >
            <Download size={16} /> Download
          </a>
        )}
      </div>
    </div>
  );
}
