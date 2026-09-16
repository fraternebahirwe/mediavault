import { apiClient } from "./client";
import { FileCategory, FileItem, SortBy, SortOrder } from "../types";

export interface FileListParams {
  category?: FileCategory;
  folderId?: string | null;
  search?: string;
  tag?: string;
  minSize?: number;
  maxSize?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export async function listFilesRequest(params: FileListParams) {
  // folderId has three meaningful states: undefined ("don't filter by
  // folder"), null ("root only" -> sent as an empty string so the backend
  // can tell it apart from "not provided"), or a real folder id.
  const { folderId, ...rest } = params;
  const query: Record<string, unknown> = { ...rest };
  if (folderId === null) {
    query.folderId = "";
  } else if (folderId !== undefined) {
    query.folderId = folderId;
  }

  const res = await apiClient.get<FileItem[]>("/files", { params: query });
  return res.data;
}

export async function uploadFileRequest(
  file: File,
  folderId: string | undefined,
  onProgress: (percent: number) => void
) {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) formData.append("folderId", folderId);

  const res = await apiClient.post<FileItem>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return res.data;
}

export async function renameFileRequest(id: string, fileName: string) {
  const res = await apiClient.patch<FileItem>(`/files/${id}/rename`, { fileName });
  return res.data;
}

export async function moveFileRequest(id: string, folderId: string | null) {
  const res = await apiClient.patch<FileItem>(`/files/${id}/move`, { folderId });
  return res.data;
}

export async function toggleFavoriteRequest(id: string) {
  const res = await apiClient.patch<FileItem>(`/files/${id}/favorite`);
  return res.data;
}

export async function addTagsRequest(id: string, tags: string[]) {
  const res = await apiClient.post<FileItem>(`/files/${id}/tags`, { tags });
  return res.data;
}

export async function removeTagRequest(id: string, tagId: string) {
  const res = await apiClient.delete<FileItem>(`/files/${id}/tags/${tagId}`);
  return res.data;
}

export async function trashFileRequest(id: string) {
  const res = await apiClient.post<FileItem>(`/files/${id}/trash`);
  return res.data;
}

export async function restoreFileRequest(id: string) {
  const res = await apiClient.post<FileItem>(`/files/${id}/restore`);
  return res.data;
}

export async function permanentlyDeleteFileRequest(id: string) {
  await apiClient.delete(`/files/${id}`);
}

export async function emptyTrashRequest() {
  const res = await apiClient.post<{ deletedCount: number }>("/files/trash/empty");
  return res.data;
}
