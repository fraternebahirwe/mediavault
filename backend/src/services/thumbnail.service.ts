import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { FileType } from "@prisma/client";
import { storageProvider } from "../storage";

const THUMB_SIZE = 400;

export async function generateThumbnail(
  buffer: Buffer,
  fileType: FileType,
  userId: string
): Promise<string | null> {
  if (fileType !== FileType.PHOTO) return null;

  try {
    const thumbBuffer = await sharp(buffer)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();

    const key = `thumbnails/${userId}/${uuid()}.webp`;
    const result = await storageProvider.upload({
      key,
      buffer: thumbBuffer,
      contentType: "image/webp",
    });
    return result.storageUrl;
  } catch {
    return null;
  }
}
