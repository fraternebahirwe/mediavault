import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { CheckCircle2, File as FileIcon, UploadCloud, X, XCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useUploadContext } from "../../context/UploadContext";
import { useUploadFile } from "../../hooks/useFiles";
import { formatBytes } from "../../utils/formatBytes";
import { getApiErrorMessage } from "../../api/client";

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/webm": [".webm"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
};

const MAX_FILE_SIZE = 200 * 1024 * 1024;

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
};

export function UploadModal() {
  const { isOpen, targetFolderId, closeUpload } = useUploadContext();
  const uploadMutation = useUploadFile();
  const [items, setItems] = useState<UploadItem[]>([]);

  const uploadOne = useCallback(
    (file: File) => {
      const id = `${file.name}-${file.size}-${Date.now()}`;
      setItems((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

      uploadMutation.mutate(
        {
          file,
          folderId: targetFolderId,
          onProgress: (progress) =>
            setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress } : it))),
        },
        {
          onSuccess: () =>
            setItems((prev) =>
              prev.map((it) => (it.id === id ? { ...it, status: "done", progress: 100 } : it))
            ),
          onError: (err) =>
            setItems((prev) =>
              prev.map((it) =>
                it.id === id
                  ? { ...it, status: "error", errorMessage: getApiErrorMessage(err, "Upload failed") }
                  : it
              )
            ),
        }
      );
    },
    [targetFolderId, uploadMutation]
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      accepted.forEach(uploadOne);
      rejected.forEach(({ file, errors }) => {
        setItems((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.size}-${Date.now()}`,
            file,
            progress: 0,
            status: "error",
            errorMessage: errors[0]?.message ?? "File rejected",
          },
        ]);
      });
    },
    [uploadOne]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const handleClose = () => {
    setItems([]);
    closeUpload();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload files" widthClass="max-w-lg">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl2 p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-brand-400"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Images, videos, and documents up to {formatBytes(MAX_FILE_SIZE)}
        </p>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
              <FileIcon size={18} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.file.name}</p>
                {item.status === "uploading" && (
                  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <p className="text-xs text-red-500 mt-0.5">{item.errorMessage}</p>
                )}
              </div>
              {item.status === "done" && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
              {item.status === "error" && <XCircle size={18} className="text-red-500 shrink-0" />}
              {item.status === "uploading" && (
                <span className="text-xs text-gray-500 shrink-0">{item.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button className="btn-secondary" onClick={handleClose}>
          <X size={16} />
          Close
        </button>
      </div>
    </Modal>
  );
}
