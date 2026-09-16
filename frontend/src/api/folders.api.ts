import { apiClient } from "./client";
import { Folder } from "../types";

export async function listFoldersRequest(parentId?: string | null) {
  const res = await apiClient.get<Folder[]>("/folders", {
    params: parentId === undefined ? undefined : { parentId: parentId ?? "" },
  });
  return res.data;
}

export async function createFolderRequest(name: string, parentId?: string) {
  const res = await apiClient.post<Folder>("/folders", { name, parentId });
  return res.data;
}

export async function renameFolderRequest(id: string, name: string) {
  const res = await apiClient.patch<Folder>(`/folders/${id}`, { name });
  return res.data;
}

export async function deleteFolderRequest(id: string) {
  await apiClient.delete(`/folders/${id}`);
}
