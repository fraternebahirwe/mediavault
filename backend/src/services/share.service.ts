import crypto from "crypto";
import { SharePermission } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { getFileOrThrow } from "./file.service";

export async function createShareLink(
  userId: string,
  fileId: string,
  options: { permission?: SharePermission; isPublic?: boolean; expiresAt?: string }
) {
  await getFileOrThrow(userId, fileId);

  const token = crypto.randomBytes(16).toString("hex");
  return prisma.sharedLink.create({
    data: {
      token,
      fileId,
      userId,
      permission: options.permission ?? SharePermission.VIEW,
      isPublic: options.isPublic ?? true,
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
    },
  });
}

export async function listShareLinksForFile(userId: string, fileId: string) {
  await getFileOrThrow(userId, fileId);
  return prisma.sharedLink.findMany({ where: { fileId, userId }, orderBy: { createdAt: "desc" } });
}

export async function setShareLinkActive(userId: string, linkId: string, isActive: boolean) {
  const link = await prisma.sharedLink.findFirst({ where: { id: linkId, userId } });
  if (!link) throw ApiError.notFound("Share link not found");
  return prisma.sharedLink.update({ where: { id: linkId }, data: { isActive } });
}

export async function deleteShareLink(userId: string, linkId: string) {
  const link = await prisma.sharedLink.findFirst({ where: { id: linkId, userId } });
  if (!link) throw ApiError.notFound("Share link not found");
  await prisma.sharedLink.delete({ where: { id: linkId } });
}

export async function resolvePublicShareLink(token: string) {
  const link = await prisma.sharedLink.findUnique({
    where: { token },
    include: { file: true },
  });

  if (!link || !link.isActive || link.file.isDeleted) {
    throw ApiError.notFound("This link is invalid or has been disabled");
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    throw ApiError.notFound("This link has expired");
  }

  return link;
}
