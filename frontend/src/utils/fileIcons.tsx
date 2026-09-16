import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File as FileIcon,
} from "lucide-react";
import { FileType } from "../types";

export function getFileIcon(fileType: FileType, mimeType: string) {
  if (fileType === "PHOTO") return FileImage;
  if (fileType === "VIDEO") return FileVideo;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("zip")) return FileArchive;
  return FileIcon;
}

export function getFileTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPEG Image",
    "image/jpg": "JPG Image",
    "image/png": "PNG Image",
    "image/webp": "WEBP Image",
    "image/gif": "GIF Image",
    "video/mp4": "MP4 Video",
    "video/quicktime": "MOV Video",
    "video/webm": "WEBM Video",
    "application/pdf": "PDF Document",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
    "text/plain": "Text File",
    "application/vnd.ms-excel": "Excel Spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
    "application/vnd.ms-powerpoint": "PowerPoint Presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint Presentation",
  };
  return map[mimeType] ?? mimeType;
}
