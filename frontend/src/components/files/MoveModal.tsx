import { Folder as FolderIcon, Home } from "lucide-react";
import { Modal } from "../ui/Modal";
import { FileItem } from "../../types";
import { useFolders } from "../../hooks/useFolders";
import { useMoveFile } from "../../hooks/useFiles";
import { Spinner } from "../ui/Spinner";

export function MoveModal({ file, onClose }: { file: FileItem | null; onClose: () => void }) {
  const { data: folders, isLoading } = useFolders(null);
  const moveMutation = useMoveFile();

  const handleMove = (folderId: string | null) => {
    if (!file) return;
    moveMutation.mutate({ id: file.id, folderId }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={!!file} onClose={onClose} title="Move file">
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
        <button
          onClick={() => handleMove(null)}
          disabled={moveMutation.isPending}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm"
        >
          <Home size={16} className="text-gray-400" /> Root (no folder)
        </button>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner className="text-brand-600" />
          </div>
        )}

        {folders?.map((folder) => (
          <button
            key={folder.id}
            onClick={() => handleMove(folder.id)}
            disabled={moveMutation.isPending}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm"
          >
            <FolderIcon size={16} className="text-brand-500" /> {folder.name}
          </button>
        ))}

        {folders?.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-4 text-center">
            No folders yet. Create one from the toolbar first.
          </p>
        )}
      </div>
    </Modal>
  );
}
