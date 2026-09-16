import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderPlus,
  Grid2x2,
  Home,
  List,
  Trash,
  Upload,
} from "lucide-react";
import { FileCategory, FileItem, SortBy, SortOrder, ViewMode } from "../types";
import { useFiles, useEmptyTrash, useRestoreFile, useToggleFavorite, useTrashFile, usePermanentlyDeleteFile } from "../hooks/useFiles";
import { useFolders } from "../hooks/useFolders";
import { useUploadContext } from "../context/UploadContext";
import { FileGrid } from "../components/files/FileGrid";
import { SortMenu } from "../components/files/SortMenu";
import { FilterPanel, FileFilters } from "../components/files/FilterPanel";
import { CreateFolderModal } from "../components/files/CreateFolderModal";
import { RenameModal } from "../components/files/RenameModal";
import { MoveModal } from "../components/files/MoveModal";
import { ShareModal } from "../components/files/ShareModal";
import { PreviewModal } from "../components/files/PreviewModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";

const CATEGORY_META: Record<FileCategory, { title: string; description: string }> = {
  all: { title: "All Files", description: "Everything you've uploaded" },
  photos: { title: "Photos", description: "JPG, PNG, WEBP, GIF images" },
  videos: { title: "Videos", description: "MP4, MOV, WEBM videos" },
  documents: { title: "Documents", description: "PDF, Word, Excel, PowerPoint & text" },
  favorites: { title: "Favorites", description: "Files you've starred" },
  recent: { title: "Recently Added", description: "Your latest uploads" },
  trash: { title: "Trash", description: "Deleted files, kept until you empty the trash" },
};

export function FilesPage() {
  const { category = "all" } = useParams<{ category: FileCategory }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openUpload } = useUploadContext();

  const search = searchParams.get("search") ?? "";
  const [folderId, setFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filters, setFilters] = useState<FileFilters>({});
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [moveTarget, setMoveTarget] = useState<FileItem | null>(null);
  const [shareTarget, setShareTarget] = useState<FileItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false);

  useEffect(() => {
    setFolderId(null);
  }, [category]);

  const isTrash = category === "trash";
  const showFolders = category === "all" && !search;

  const { data: folders } = useFolders(folderId, showFolders);
  const { data: files, isLoading } = useFiles({
    category,
    folderId: category === "all" ? folderId : undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
    ...filters,
  });

  const toggleFavorite = useToggleFavorite();
  const trashFile = useTrashFile();
  const restoreFile = useRestoreFile();
  const permanentlyDelete = usePermanentlyDeleteFile();
  const emptyTrash = useEmptyTrash();

  const currentFolder = useMemo(
    () => folders?.find((f) => f.id === folderId) ?? null,
    [folders, folderId]
  );

  const handleDownload = (file: FileItem) => {
    const link = document.createElement("a");
    link.href = file.storageUrl;
    link.download = file.fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleDelete = (file: FileItem) => {
    if (isTrash) {
      setDeleteTarget(file);
    } else {
      trashFile.mutate(file.id);
    }
  };

  const confirmPermanentDelete = () => {
    if (!deleteTarget) return;
    permanentlyDelete.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const meta = CATEGORY_META[category as FileCategory] ?? CATEGORY_META.all;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <button onClick={() => navigate(`/files/${category}`)} className="hover:text-brand-600 flex items-center gap-1">
              <Home size={13} /> {meta.title}
            </button>
            {currentFolder && (
              <>
                <ChevronRight size={13} />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{currentFolder.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold">{currentFolder?.name ?? meta.title}</h1>
          {!currentFolder && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meta.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTrash && (
            <button
              className="btn-danger"
              onClick={() => setEmptyTrashConfirmOpen(true)}
              disabled={!files || files.length === 0}
            >
              <Trash size={16} /> Empty Trash
            </button>
          )}
          {category === "all" && (
            <button className="btn-secondary" onClick={() => setCreateFolderOpen(true)}>
              <FolderPlus size={16} /> New folder
            </button>
          )}
          <button className="btn-primary" onClick={() => openUpload(folderId ?? undefined)}>
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SortMenu sortBy={sortBy} sortOrder={sortOrder} onChange={(sb, so) => { setSortBy(sb); setSortOrder(so); }} />
          <FilterPanel filters={filters} onApply={setFilters} />
          {search && (
            <button
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600"
              onClick={() => setSearchParams({})}
            >
              Clear search "{search}"
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 card p-0.5">
          <button
            className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40" : "text-gray-400"}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid2x2 size={16} />
          </button>
          <button
            className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40" : "text-gray-400"}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {showFolders && folders && folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setFolderId(folder.id)}
              className="card p-3 flex items-center gap-2 hover:shadow-soft text-left"
            >
              <FolderIcon size={20} className="text-brand-500 shrink-0" />
              <span className="text-sm font-medium truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-brand-600" size={28} />
        </div>
      ) : !files || files.length === 0 ? (
        <EmptyState
          icon={isTrash ? Trash : Upload}
          title={isTrash ? "Trash is empty" : "No files here yet"}
          description={
            isTrash ? "Files you delete will appear here." : "Upload files or drag them into this folder to get started."
          }
          action={
            !isTrash && (
              <button className="btn-primary" onClick={() => openUpload(folderId ?? undefined)}>
                <Upload size={16} /> Upload files
              </button>
            )
          }
        />
      ) : (
        <FileGrid
          files={files}
          viewMode={viewMode}
          isTrash={isTrash}
          onOpen={setPreviewFile}
          onDownload={handleDownload}
          onRename={setRenameTarget}
          onMove={setMoveTarget}
          onToggleFavorite={(file) => toggleFavorite.mutate(file.id)}
          onShare={setShareTarget}
          onDelete={handleDelete}
          onRestore={(file) => restoreFile.mutate(file.id)}
        />
      )}

      <CreateFolderModal isOpen={createFolderOpen} onClose={() => setCreateFolderOpen(false)} />
      <RenameModal file={renameTarget} onClose={() => setRenameTarget(null)} />
      <MoveModal file={moveTarget} onClose={() => setMoveTarget(null)} />
      <ShareModal file={shareTarget} onClose={() => setShareTarget(null)} />
      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmPermanentDelete}
        title="Delete permanently?"
        description={`"${deleteTarget?.fileName}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete forever"
        isLoading={permanentlyDelete.isPending}
      />

      <ConfirmDialog
        isOpen={emptyTrashConfirmOpen}
        onClose={() => setEmptyTrashConfirmOpen(false)}
        onConfirm={() => emptyTrash.mutate(undefined, { onSuccess: () => setEmptyTrashConfirmOpen(false) })}
        title="Empty Trash?"
        description="All files in Trash will be permanently deleted. This action cannot be undone."
        confirmLabel="Empty Trash"
        isLoading={emptyTrash.isPending}
      />
    </div>
  );
}
