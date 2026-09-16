import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Link2, Power, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { FileItem, SharePermission } from "../../types";
import {
  useCreateShareLink,
  useDeleteShareLink,
  useSetShareLinkActive,
  useShareLinks,
} from "../../hooks/useShare";
import { Spinner } from "../ui/Spinner";

export function ShareModal({ file, onClose }: { file: FileItem | null; onClose: () => void }) {
  const fileId = file?.id ?? null;
  const { data: links, isLoading } = useShareLinks(fileId);
  const createMutation = useCreateShareLink(fileId);
  const toggleMutation = useSetShareLinkActive(fileId);
  const deleteMutation = useDeleteShareLink(fileId);
  const [permission, setPermission] = useState<SharePermission>("VIEW");

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <Modal isOpen={!!file} onClose={onClose} title="Share file" widthClass="max-w-lg">
      <div className="flex items-center gap-2 mb-4">
        <select
          className="input flex-1"
          value={permission}
          onChange={(e) => setPermission(e.target.value as SharePermission)}
        >
          <option value="VIEW">Anyone with the link can view</option>
          <option value="DOWNLOAD">Anyone with the link can download</option>
        </select>
        <button
          className="btn-primary shrink-0"
          onClick={() => createMutation.mutate({ permission, isPublic: true })}
          disabled={createMutation.isPending}
        >
          <Link2 size={16} /> Create link
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner className="text-brand-600" />
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {links?.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{link.shareUrl}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {link.permission === "DOWNLOAD" ? "View & download" : "View only"} &middot;{" "}
                {link.isActive ? "Active" : "Disabled"}
              </p>
            </div>
            <button
              className="btn-ghost p-1.5 rounded-full"
              title="Copy link"
              onClick={() => copyLink(link.shareUrl)}
            >
              <Copy size={15} />
            </button>
            <button
              className="btn-ghost p-1.5 rounded-full"
              title={link.isActive ? "Disable link" : "Enable link"}
              onClick={() => toggleMutation.mutate({ id: link.id, isActive: !link.isActive })}
            >
              <Power size={15} className={link.isActive ? "text-green-500" : "text-gray-400"} />
            </button>
            <button
              className="btn-ghost p-1.5 rounded-full text-red-500"
              title="Delete link"
              onClick={() => deleteMutation.mutate(link.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {links?.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No share links yet. Create one above.
          </p>
        )}
      </div>
    </Modal>
  );
}
