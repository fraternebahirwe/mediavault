import { FormEvent, useState } from "react";
import { Modal } from "../ui/Modal";
import { useCreateFolder } from "../../hooks/useFolders";

export function CreateFolderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const createMutation = useCreateFolder();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New folder">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="input"
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
