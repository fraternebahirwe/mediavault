import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { FileItem } from "../../types";
import { useRenameFile } from "../../hooks/useFiles";

export function RenameModal({ file, onClose }: { file: FileItem | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const renameMutation = useRenameFile();

  useEffect(() => {
    if (file) setName(file.fileName);
  }, [file]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    renameMutation.mutate(
      { id: file.id, fileName: name.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen={!!file} onClose={onClose} title="Rename file">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={renameMutation.isPending}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
