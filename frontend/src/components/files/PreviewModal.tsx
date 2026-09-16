import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Maximize, Minus, Plus, Star, X } from "lucide-react";
import { FileItem } from "../../types";
import { formatBytes, formatDate } from "../../utils/formatBytes";
import { getFileIcon, getFileTypeLabel } from "../../utils/fileIcons";
import { useToggleFavorite } from "../../hooks/useFiles";

export function PreviewModal({ file, onClose }: { file: FileItem | null; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    setZoom(1);
  }, [file?.id]);

  useEffect(() => {
    if (!file) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [file, onClose]);

  if (!file) return null;

  const enterFullscreen = () => {
    containerRef.current?.requestFullscreen?.();
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = file.storageUrl;
    link.download = file.fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const Icon = getFileIcon(file.fileType, file.mimeType);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 animate-fade-in" ref={containerRef}>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="font-medium truncate">{file.fileName}</p>
          <p className="text-xs text-gray-300">
            {getFileTypeLabel(file.mimeType)} &middot; {formatBytes(file.fileSize)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {file.fileType === "PHOTO" && (
            <>
              <button
                className="p-2 rounded-full hover:bg-white/10"
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                aria-label="Zoom out"
              >
                <Minus size={18} />
              </button>
              <button
                className="p-2 rounded-full hover:bg-white/10"
                onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
                aria-label="Zoom in"
              >
                <Plus size={18} />
              </button>
            </>
          )}
          <button
            className="p-2 rounded-full hover:bg-white/10"
            onClick={enterFullscreen}
            aria-label="Fullscreen"
          >
            <Maximize size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10"
            onClick={() => toggleFavorite.mutate(file.id)}
            aria-label="Toggle favorite"
          >
            <Star size={18} className={file.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10" onClick={download} aria-label="Download">
            <Download size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {file.fileType === "PHOTO" && (
          <img
            src={file.storageUrl}
            alt={file.fileName}
            className="max-w-full max-h-full object-contain transition-transform cursor-zoom-in"
            style={{ transform: `scale(${zoom})` }}
            onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
          />
        )}

        {file.fileType === "VIDEO" && (
          <video src={file.storageUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
        )}

        {file.fileType === "DOCUMENT" && file.mimeType === "application/pdf" && (
          <iframe src={file.storageUrl} title={file.fileName} className="w-full h-full bg-white rounded-lg" />
        )}

        {file.fileType === "DOCUMENT" && file.mimeType !== "application/pdf" && (
          <div className="flex flex-col items-center text-white gap-3 text-center">
            <Icon size={56} className="text-gray-300" />
            <p className="font-medium">{file.fileName}</p>
            <p className="text-sm text-gray-300">
              {getFileTypeLabel(file.mimeType)} &middot; {formatBytes(file.fileSize)} &middot; Uploaded{" "}
              {formatDate(file.createdAt)}
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              Preview isn't available for this file type. Download it to view the contents.
            </p>
            <button className="btn-primary mt-2" onClick={download}>
              <Download size={16} /> Download
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
