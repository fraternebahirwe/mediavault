import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export async function createFolder(userId: string, name: string, parentId?: string) {
  if (parentId) {
    const parent = await prisma.folder.findFirst({
      where: { id: parentId, userId, isDeleted: false },
    });
    if (!parent) throw ApiError.notFound("Parent folder not found");
  }

  return prisma.folder.create({ data: { name, userId, parentId } });
}

export async function listFolders(userId: string, parentId?: string | null) {
  return prisma.folder.findMany({
    where: {
      userId,
      isDeleted: false,
      parentId: parentId === undefined ? undefined : parentId,
    },
    orderBy: { name: "asc" },
  });
}

export async function renameFolder(userId: string, folderId: string, name: string) {
  const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
  if (!folder) throw ApiError.notFound("Folder not found");
  return prisma.folder.update({ where: { id: folderId }, data: { name } });
}

export async function deleteFolder(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
  if (!folder) throw ApiError.notFound("Folder not found");

  await prisma.$transaction([
    prisma.folder.update({
      where: { id: folderId },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
    prisma.file.updateMany({
      where: { folderId, userId },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
  ]);
}
