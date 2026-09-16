import { prisma } from "../config/prisma";

export async function getStorageUsedBytes(userId: string): Promise<bigint> {
  // Trashed files still occupy real storage until they're permanently
  // deleted (a File row only disappears on permanent delete / empty trash),
  // so they must count against quota too - otherwise a user could dodge
  // their storage limit by trashing files without emptying the trash.
  const result = await prisma.file.aggregate({
    where: { userId },
    _sum: { fileSize: true },
  });
  return result._sum.fileSize ?? BigInt(0);
}

export async function getUserPublicProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, storageLimit: true, createdAt: true },
  });
  const storageUsed = await getStorageUsedBytes(userId);
  return { ...user, storageUsed };
}
