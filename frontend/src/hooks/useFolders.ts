import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createFolderRequest,
  deleteFolderRequest,
  listFoldersRequest,
  renameFolderRequest,
} from "../api/folders.api";
import { getApiErrorMessage } from "../api/client";

export function useFolders(parentId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["folders", parentId ?? null],
    queryFn: () => listFoldersRequest(parentId),
    enabled,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; parentId?: string }) =>
      createFolderRequest(vars.name, vars.parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not create folder")),
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string }) => renameFolderRequest(vars.id, vars.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder renamed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not rename folder")),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFolderRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Folder deleted");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete folder")),
  });
}
