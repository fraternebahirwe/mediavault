import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addTagsRequest,
  emptyTrashRequest,
  FileListParams,
  listFilesRequest,
  moveFileRequest,
  permanentlyDeleteFileRequest,
  removeTagRequest,
  renameFileRequest,
  restoreFileRequest,
  toggleFavoriteRequest,
  trashFileRequest,
  uploadFileRequest,
} from "../api/files.api";
import { getApiErrorMessage } from "../api/client";

export const filesQueryKey = (params: FileListParams) => ["files", params] as const;

export function useFiles(params: FileListParams) {
  return useQuery({
    queryKey: filesQueryKey(params),
    queryFn: () => listFilesRequest(params),
  });
}

function useInvalidateFiles() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useUploadFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (vars: { file: File; folderId?: string; onProgress: (p: number) => void }) =>
      uploadFileRequest(vars.file, vars.folderId, vars.onProgress),
    onSuccess: (file) => {
      invalidate();
      toast.success(`${file.fileName} uploaded successfully`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Upload failed")),
  });
}

export function useRenameFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (vars: { id: string; fileName: string }) =>
      renameFileRequest(vars.id, vars.fileName),
    onSuccess: () => {
      invalidate();
      toast.success("File renamed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Rename failed")),
  });
}

export function useMoveFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (vars: { id: string; folderId: string | null }) =>
      moveFileRequest(vars.id, vars.folderId),
    onSuccess: () => {
      invalidate();
      toast.success("File moved");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Move failed")),
  });
}

export function useToggleFavorite() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (id: string) => toggleFavoriteRequest(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not update favorite")),
  });
}

export function useAddTags() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (vars: { id: string; tags: string[] }) => addTagsRequest(vars.id, vars.tags),
    onSuccess: () => {
      invalidate();
      toast.success("Tags updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not add tags")),
  });
}

export function useRemoveTag() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (vars: { id: string; tagId: string }) => removeTagRequest(vars.id, vars.tagId),
    onSuccess: invalidate,
  });
}

export function useTrashFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (id: string) => trashFileRequest(id),
    onSuccess: () => {
      invalidate();
      toast.success("Moved to Trash");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete file")),
  });
}

export function useRestoreFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (id: string) => restoreFileRequest(id),
    onSuccess: () => {
      invalidate();
      toast.success("File restored");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not restore file")),
  });
}

export function usePermanentlyDeleteFile() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: (id: string) => permanentlyDeleteFileRequest(id),
    onSuccess: () => {
      invalidate();
      toast.success("File permanently deleted");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete file")),
  });
}

export function useEmptyTrash() {
  const invalidate = useInvalidateFiles();
  return useMutation({
    mutationFn: () => emptyTrashRequest(),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Trash emptied (${result.deletedCount} files removed)`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not empty trash")),
  });
}
