import {
  Download,
  Edit3,
  ExternalLink,
  FolderInput,
  MoreVertical,
  RotateCcw,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { FileItem } from "../../types";

interface FileMenuProps {
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

export function FileMenu({
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onToggleFavorite,
  onShare,
  onDelete,
  onRestore,
  isTrash,
}: FileMenuProps) {
  return (
    <Dropdown
      trigger={
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      }
    >
      {(close) => (
        <>
          {isTrash ? (
            <>
              <DropdownItem
                onClick={() => {
                  close();
                  onRestore?.();
                }}
              >
                <RotateCcw size={15} /> Restore
              </DropdownItem>
              <DropdownItem
                danger
                onClick={() => {
                  close();
                  onDelete();
                }}
              >
                <Trash2 size={15} /> Delete permanently
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem
                onClick={() => {
                  close();
                  onOpen();
                }}
              >
                <ExternalLink size={15} /> Open
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  onDownload();
                }}
              >
                <Download size={15} /> Download
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  onRename();
                }}
              >
                <Edit3 size={15} /> Rename
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  onMove();
                }}
              >
                <FolderInput size={15} /> Move
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  onToggleFavorite();
                }}
              >
                <Star size={15} className={file.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
                {file.isFavorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  close();
                  onShare();
                }}
              >
                <Share2 size={15} /> Share
              </DropdownItem>
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
              <DropdownItem
                danger
                onClick={() => {
                  close();
                  onDelete();
                }}
              >
                <Trash2 size={15} /> Delete
              </DropdownItem>
            </>
          )}
        </>
      )}
    </Dropdown>
  );
}
