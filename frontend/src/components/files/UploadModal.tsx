import { ChangeEvent, useCallback, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { CheckCircle2, File as FileIcon, FolderUp, UploadCloud, X, XCircle } from "lucide-react";
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

const ALLOWED_EXTENSIONS = new Set(Object.values(ACCEPTED_TYPES).flat());

// The <input webkitdirectory> path (and manually-fed files in general) skip
// react-dropzone's accept/maxSize validators, since those only run on drag
// events - so folder selection needs its own equivalent checks.
function isAllowedFile(file: File): boolean {
  if (file.type && file.type in ACCEPTED_TYPES) return true;
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

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
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addRejected = useCallback((file: File, errorMessage: string) => {
    setItems((prev) => [
      ...prev,
      { id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, file, progress: 0, status: "error", errorMessage },
    ]);
  }, []);

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
      rejected.forEach(({ file, errors }) => addRejected(file, errors[0]?.message ?? "File rejected"));
    },
    [uploadOne, addRejected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  // Folders dropped directly onto the dropzone above are already expanded
  // into individual files by react-dropzone/file-selector. This handler
  // covers the "click to choose a folder" path via a plain <input
  // webkitdirectory> element, whose files bypass react-dropzone entirely -
  // so type/size are validated by hand and every file lands flat in
  // whichever folder is currently open (subfolder structure isn't kept).
  const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        addRejected(file, `File is larger than ${formatBytes(MAX_FILE_SIZE)}`);
      } else if (!isAllowedFile(file)) {
        addRejected(file, "Unsupported file type");
      } else {
        uploadOne(file);
      }
    });
    e.target.value = "";
  };

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
        <p className="text-sm font-medium">Drag & drop files or a folder here, or click to browse</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Images, videos, and documents up to {formatBytes(MAX_FILE_SIZE)}
        </p>
      </div>

      <div className="flex items-center justify-center mt-3">
        <button
          type="button"
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            folderInputRef.current?.click();
          }}
        >
          <FolderUp size={13} />
          or select a folder to upload
        </button>
        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          // @ts-expect-error - non-standard attributes, not in the DOM lib's typings
          webkitdirectory="true"
          directory="true"
          mozdirectory="true"
          onChange={handleFolderSelect}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
        All files inside the folder are added here; the folder structure itself isn't recreated.
      </p>

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
