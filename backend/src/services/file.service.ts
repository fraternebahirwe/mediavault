import path from "path";
import { v4 as uuid } from "uuid";
import { File, FileType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { storageProvider } from "../storage";
import { ApiError } from "../utils/apiError";
import { classifyMimeType } from "../utils/fileType";
import { generateThumbnail } from "./thumbnail.service";
import { getStorageUsedBytes } from "./user.service";

export interface FileListQuery {
  category?: "all" | "photos" | "videos" | "documents" | "favorites" | "recent" | "trash";
  folderId?: string | null;
  search?: string;
  tag?: string;
  minSize?: number;
  maxSize?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: "name" | "date" | "size" | "type";
  sortOrder?: "asc" | "desc";
}

const CATEGORY_TYPE: Record<string, FileType | undefined> = {
  photos: FileType.PHOTO,
  videos: FileType.VIDEO,
  documents: FileType.DOCUMENT,
};

export async function uploadFile(params: {
  userId: string;
  folderId?: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<File> {
  const { userId, folderId, originalName, mimeType, buffer } = params;

  const fileType = classifyMimeType(mimeType);
  if (!fileType) throw ApiError.badRequest(`Unsupported file type: ${mimeType}`);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const used = await getStorageUsedBytes(userId);
  if (used + BigInt(buffer.length) > user.storageLimit) {
    throw ApiError.badRequest("Storage limit exceeded. Free up space or upgrade your plan.");
  }

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });
    if (!folder) throw ApiError.notFound("Destination folder not found");
  }

  const ext = path.extname(originalName);
  const key = `files/${userId}/${uuid()}${ext}`;
  const { storageUrl } = await storageProvider.upload({
    key,
    buffer,
    contentType: mimeType,
  });

  const thumbnailUrl = await generateThumbnail(buffer, fileType, userId);

  return prisma.file.create({
    data: {
      userId,
      folderId: folderId ?? null,
      fileName: originalName,
      fileType,
      mimeType,
      fileSize: BigInt(buffer.length),
      storageKey: key,
      storageUrl,
      thumbnailUrl,
    },
  });
}

function buildWhereClause(userId: string, query: FileListQuery): Prisma.FileWhereInput {
  const where: Prisma.FileWhereInput = { userId };

  if (query.category === "trash") {
    where.isDeleted = true;
  } else {
    where.isDeleted = false;
  }

  if (query.category === "favorites") where.isFavorite = true;
  if (query.category && CATEGORY_TYPE[query.category]) {
    where.fileType = CATEGORY_TYPE[query.category];
  }

  if (query.folderId !== undefined) where.folderId = query.folderId;

  if (query.search) {
    where.fileName = { contains: query.search, mode: "insensitive" };
  }

  if (query.tag) {
    where.tags = { some: { tag: { name: query.tag } } };
  }

  if (query.minSize !== undefined || query.maxSize !== undefined) {
    where.fileSize = {
      ...(query.minSize !== undefined ? { gte: BigInt(query.minSize) } : {}),
      ...(query.maxSize !== undefined ? { lte: BigInt(query.maxSize) } : {}),
    };
  }

  if (query.fromDate || query.toDate) {
    where.createdAt = {
      ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
      ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
    };
  }

  return where;
}

function buildOrderBy(query: FileListQuery): Prisma.FileOrderByWithRelationInput {
  const order = query.sortOrder ?? "desc";
  switch (query.sortBy) {
    case "name":
      return { fileName: order };
    case "size":
      return { fileSize: order };
    case "type":
      return { fileType: order };
    case "date":
    default:
      return { createdAt: order };
  }
}

export async function listFiles(userId: string, query: FileListQuery) {
  const where = buildWhereClause(userId, query);
  const orderBy =
    query.category === "recent" ? { createdAt: "desc" as const } : buildOrderBy(query);
  const take = query.category === "recent" ? 20 : undefined;

  return prisma.file.findMany({
    where,
    orderBy,
    take,
    include: { tags: { include: { tag: true } }, folder: true },
  });
}

export async function getFileOrThrow(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
    include: { tags: { include: { tag: true } } },
  });
  if (!file) throw ApiError.notFound("File not found");
  return file;
}

export async function renameFile(userId: string, fileId: string, fileName: string) {
  await getFileOrThrow(userId, fileId);
  return prisma.file.update({
    where: { id: fileId },
    data: { fileName },
    include: { tags: { include: { tag: true } } },
  });
}

export async function moveFile(userId: string, fileId: string, folderId: string | null) {
  await getFileOrThrow(userId, fileId);
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });
    if (!folder) throw ApiError.notFound("Destination folder not found");
  }
  return prisma.file.update({
    where: { id: fileId },
    data: { folderId },
    include: { tags: { include: { tag: true } } },
  });
}

export async function toggleFavorite(userId: string, fileId: string) {
  const file = await getFileOrThrow(userId, fileId);
  return prisma.file.update({
    where: { id: fileId },
    data: { isFavorite: !file.isFavorite },
    include: { tags: { include: { tag: true } } },
  });
}

export async function addTags(userId: string, fileId: string, tagNames: string[]) {
  await getFileOrThrow(userId, fileId);

  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId, name: trimmed } },
      create: { userId, name: trimmed },
      update: {},
    });

    await prisma.fileTag.upsert({
      where: { fileId_tagId: { fileId, tagId: tag.id } },
      create: { fileId, tagId: tag.id },
      update: {},
    });
  }

  return getFileOrThrow(userId, fileId);
}

export async function removeTag(userId: string, fileId: string, tagId: string) {
  await getFileOrThrow(userId, fileId);
  await prisma.fileTag.deleteMany({ where: { fileId, tagId } });
  return getFileOrThrow(userId, fileId);
}

export async function softDeleteFile(userId: string, fileId: string) {
  await getFileOrThrow(userId, fileId);
  return prisma.file.update({
    where: { id: fileId },
    data: { isDeleted: true, deletedAt: new Date() },
    include: { tags: { include: { tag: true } } },
  });
}

export async function restoreFile(userId: string, fileId: string) {
  await getFileOrThrow(userId, fileId);
  return prisma.file.update({
    where: { id: fileId },
    data: { isDeleted: false, deletedAt: null },
    include: { tags: { include: { tag: true } } },
  });
}

export async function permanentlyDeleteFile(userId: string, fileId: string) {
  const file = await getFileOrThrow(userId, fileId);
  await storageProvider.remove(file.storageKey);
  await prisma.file.delete({ where: { id: fileId } });
}

export async function emptyTrash(userId: string) {
  const trashedFiles = await prisma.file.findMany({
    where: { userId, isDeleted: true },
  });

  await Promise.all(trashedFiles.map((file) => storageProvider.remove(file.storageKey)));
  await prisma.file.deleteMany({ where: { userId, isDeleted: true } });

  return trashedFiles.length;
}

export async function getDashboardStats(userId: string) {
  const [total, photos, videos, documents, favorites, recent, storageUsed, user] =
    await Promise.all([
      prisma.file.count({ where: { userId, isDeleted: false } }),
      prisma.file.count({ where: { userId, isDeleted: false, fileType: FileType.PHOTO } }),
      prisma.file.count({ where: { userId, isDeleted: false, fileType: FileType.VIDEO } }),
      prisma.file.count({ where: { userId, isDeleted: false, fileType: FileType.DOCUMENT } }),
      prisma.file.count({ where: { userId, isDeleted: false, isFavorite: true } }),
      prisma.file.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getStorageUsedBytes(userId),
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    ]);

  return {
    totalFiles: total,
    photos,
    videos,
    documents,
    favorites,
    recentFiles: recent,
    storageUsed,
    storageLimit: user.storageLimit,
  };
}
