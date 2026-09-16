import { apiClient } from "./client";
import { FileItem, SharedLink, SharePermission } from "../types";

export async function createShareLinkRequest(
  fileId: string,
  options: { permission?: SharePermission; isPublic?: boolean }
) {
  const res = await apiClient.post<SharedLink>("/shares", { fileId, ...options });
  return res.data;
}

export async function listShareLinksRequest(fileId: string) {
  const res = await apiClient.get<SharedLink[]>(`/shares/file/${fileId}`);
  return res.data;
}

export async function setShareLinkActiveRequest(id: string, isActive: boolean) {
  const res = await apiClient.patch<SharedLink>(`/shares/${id}`, { isActive });
  return res.data;
}

export async function deleteShareLinkRequest(id: string) {
  await apiClient.delete(`/shares/${id}`);
}

export async function getPublicShareRequest(token: string) {
  const res = await apiClient.get<{ file: FileItem; permission: SharePermission; isPublic: boolean }>(
    `/public/${token}`
  );
  return res.data;
}
