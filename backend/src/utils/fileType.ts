import { FileType } from "@prisma/client";

const PHOTO_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME = new Set(["video/mp4", "video/quicktime", "video/webm"]);

const DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const ALLOWED_MIME_TYPES = new Set([
  ...PHOTO_MIME,
  ...VIDEO_MIME,
  ...DOCUMENT_MIME,
]);

export function classifyMimeType(mimeType: string): FileType | null {
  if (PHOTO_MIME.has(mimeType)) return FileType.PHOTO;
  if (VIDEO_MIME.has(mimeType)) return FileType.VIDEO;
  if (DOCUMENT_MIME.has(mimeType)) return FileType.DOCUMENT;
  return null;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}
